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
