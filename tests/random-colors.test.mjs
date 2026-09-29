import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { Script, createContext } from "node:vm";
import test from "node:test";

const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const source = html.match(/<script\b[^>]*id="random-colors"[^>]*>([\s\S]*?)<\/script>/)?.[1];
assert.ok(source, "색상 선택 스크립트가 빌드 결과에 없습니다");
const script = new Script(source);

function pageSession() {
  const state = { saved: null, random: 0, hue: null, blockRead: false, blockWrite: false };
  const context = createContext({
    window: {},
    Math: Object.assign(Object.create(Math), { random: () => state.random }),
    sessionStorage: {
      getItem() {
        if (state.blockRead) throw new Error("Storage disabled");
        return state.saved;
      },
      setItem(_key, value) {
        if (state.blockWrite) throw new Error("Storage disabled");
        state.saved = value;
      },
    },
    document: { documentElement: { style: { setProperty(name, value) {
      assert.equal(name, "--text-hue");
      state.hue = Number(value);
    } } } },
  });
  return { state, reload: () => script.runInContext(context), refresh: () => context.window.randomizeColors() };
}

const distance = (a, b) => Math.min(Math.abs(a - b), 360 - Math.abs(a - b));

test("페이지 내부에서 반복 선택해도 저장소 없이 직전 색상을 피한다", () => {
  const { state, reload, refresh } = pageSession();
  state.blockRead = state.blockWrite = true;
  reload();
  for (let index = 0; index < 100; index++) {
    const previous = state.hue;
    state.random = (index + 0.5) / 100;
    refresh();
    assert.ok(distance(previous, state.hue) > 30);
  }
});

test("첫 방문에는 360개 색상각을 모두 선택할 수 있다", () => {
  const { state, reload } = pageSession();
  for (let hue = 0; hue < 360; hue++) {
    state.saved = null;
    state.random = (hue + 0.5) / 360;
    reload();
    assert.equal(state.hue, hue);
    assert.equal(state.saved, String(hue));
  }
});

test("모든 직전 색상에서 ±30도를 제외하고 0도 경계도 처리한다", () => {
  const { state, reload } = pageSession();
  for (let previous = 0; previous < 360; previous++) {
    const choices = new Set();
    for (let index = 0; index < 299; index++) {
      state.saved = String(previous);
      state.random = (index + 0.5) / 299;
      reload();
      assert.ok(Number.isInteger(state.hue) && state.hue >= 0 && state.hue < 360);
      assert.ok(distance(previous, state.hue) > 30);
      assert.equal(state.saved, String(state.hue));
      choices.add(state.hue);
    }
    assert.equal(choices.size, 299);
  }
});

test("바로 직전 색상만 피하므로 두 번 전 색상은 다시 나올 수 있다", () => {
  const { state, reload } = pageSession();
  state.saved = "0";
  reload();
  assert.equal(state.hue, 31);
  state.random = 1 - Number.EPSILON;
  reload();
  assert.equal(state.hue, 0);
});

test("잘못된 저장값이나 저장소 차단으로 색상 표시가 멈추지 않는다", () => {
  const { state, reload } = pageSession();
  state.random = 0.5;
  for (const saved of ["", "-1", "360", "NaN", "1.5", "invalid"]) {
    state.saved = saved;
    reload();
    assert.equal(state.hue, 180);
  }
  state.blockRead = state.blockWrite = true;
  reload();
  assert.equal(state.hue, 180);
  state.blockRead = false;
  state.saved = "180";
  reload();
  assert.ok(distance(180, state.hue) > 30);
});
