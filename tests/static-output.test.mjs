import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readOutput = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("대문이 한국어 정적 문서로 생성된다", async () => {
  const html = await readOutput("index.html");

  assert.ok(html.includes('<html lang="ko">'));
  assert.ok(html.includes("대문 - Kimjeongjae Wiki"));
  assert.ok(html.includes("Kimjeongjae Wiki에 오신 것을 환영합니다"));
  assert.ok(html.includes("오늘의 대표 문서"));
  assert.ok(!html.includes("__NEXT_DATA__"));
});

test("김정재 문서에 Wiki 문서 장치가 포함된다", async () => {
  const html = await readOutput("wiki/kimjeongjae/index.html");

  assert.ok(html.includes("김정재 - Kimjeongjae Wiki"));
  assert.ok(html.includes("infobox"));
  assert.ok(html.includes("table-of-contents"));
  assert.ok(html.includes("wikitable"));
  assert.ok(html.includes("category-links"));
  assert.ok(!html.includes("__NEXT_DATA__"));
});

test("대문 포털이 문서 데이터에서 생성된다", async () => {
  const html = await readOutput("index.html");

  for (const variant of ["featured", "explore", "facts", "changes"]) {
    assert.ok(html.includes(`portal-panel--${variant}`), `${variant} 패널이 없습니다`);
  }

  assert.ok(html.includes('<h2 id="featured-article">김정재</h2>'));
  assert.ok(html.includes('<dl class="portal-index">'));
  assert.ok(html.includes('class="wiki-notice"'));
});

test("대문의 최근 변경이 Git 기록에서 만들어진다", async () => {
  const html = await readOutput("index.html");
  const panel = html.slice(
    html.indexOf("portal-panel--changes"),
    html.indexOf("</section>", html.indexOf("portal-panel--changes")),
  );

  assert.ok(panel.includes("recent-list"), "최근 변경 목록이 없습니다");
  assert.match(panel, /<time datetime="\d{4}-\d{2}-\d{2}">/, "날짜가 없습니다");
  assert.match(panel, /class="recent-kind">(신규|수정)</, "변경 종류가 없습니다");
  // 자동 생성이므로 항목마다 실제 문서로 가는 링크가 있어야 한다.
  assert.match(panel, /<a href="\/[^"]*">[^<]+<\/a>/, "문서 링크가 없습니다");
});

test("최근 변경 전체 목록 페이지가 만들어진다", async () => {
  const html = await readOutput("wiki/recent-changes/index.html");

  assert.ok(html.includes("최근 변경 - Kimjeongjae Wiki"));
  assert.ok(html.includes("recent-list"));
  assert.match(html, /<time datetime="\d{4}-\d{2}-\d{2}">/);
  assert.ok(html.includes('href="/wiki/kimjeongjae/"'), "김정재 문서 링크가 없습니다");
  assert.ok(!html.includes("__NEXT_DATA__"));
});

test("사이드바에서 최근 변경으로 이동할 수 있다", async () => {
  const html = await readOutput("index.html");
  assert.ok(html.includes('href="/wiki/recent-changes/"'));
});

test("목차 항목이 실제 문서 위치와 연결된다", async () => {
  const html = await readOutput("index.html");
  const targets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);

  assert.ok(targets.length > 0);
  for (const target of targets) {
    assert.ok(html.includes(`id="${target}"`), `목차가 가리키는 ${target} 위치가 없습니다`);
  }
});
