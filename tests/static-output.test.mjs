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

test("모든 문서 목록이 만들어진다", async () => {
  const html = await readOutput("wiki/index.html");

  assert.ok(html.includes("모든 문서 - Kimjeongjae Wiki"));
  assert.ok(html.includes('href="/wiki/kimjeongjae/"'), "김정재 문서가 목록에 없습니다");
  assert.ok(html.includes("document-list"));
  // 분류 색인도 함께 보여준다
  assert.ok(html.includes('href="/wiki/category/인물/"'));
});

test("분류 페이지가 분류마다 만들어진다", async () => {
  const html = await readOutput("wiki/category/인물/index.html");

  assert.ok(html.includes("분류: 인물 - Kimjeongjae Wiki"));
  assert.ok(html.includes('href="/wiki/kimjeongjae/"'), "해당 분류의 문서가 없습니다");
});

test("문서의 분류가 실제 링크로 연결된다", async () => {
  const html = await readOutput("wiki/kimjeongjae/index.html");
  const block = html.slice(
    html.indexOf('class="category-links"'),
    html.indexOf("</nav>", html.indexOf('class="category-links"')),
  );

  assert.ok(block.includes('href="/wiki/category/인물/"'));
  assert.ok(!block.includes("<span>"), "분류가 아직 글자로만 표시됩니다");
});

test("검색 페이지와 검색 인덱스가 만들어진다", async () => {
  const html = await readOutput("wiki/search/index.html");
  assert.ok(html.includes("검색 - Kimjeongjae Wiki"));
  assert.ok(html.includes("/pagefind/pagefind.js"));

  const entry = await readOutput("pagefind/pagefind-entry.json");
  assert.ok(JSON.parse(entry).languages, "검색 인덱스가 비어 있습니다");
});

test("자동 생성 목록 페이지는 검색 색인에서 제외된다", async () => {
  const indexed = ["index.html", "wiki/kimjeongjae/index.html"];
  const excluded = [
    "wiki/index.html",
    "wiki/category/인물/index.html",
    "wiki/recent-changes/index.html",
    "wiki/search/index.html",
  ];

  for (const page of indexed) {
    assert.ok((await readOutput(page)).includes("data-pagefind-body"), `${page} 가 색인에서 빠졌습니다`);
  }
  for (const page of excluded) {
    assert.ok(!(await readOutput(page)).includes("data-pagefind-body"), `${page} 가 색인에 들어갔습니다`);
  }
});

test("화면에 동작하지 않는 항목이 남아 있지 않다", async () => {
  const html = await readOutput("index.html");

  assert.ok(!html.includes("sidebar-link--disabled"), "사이드바에 죽은 항목이 있습니다");
  assert.ok(!html.includes("page-tab--disabled"), "문서 탭에 죽은 항목이 있습니다");
  assert.ok(!html.includes("disabled"), "비활성 입력이 남아 있습니다");
});

test("없는 주소로 들어오면 안내 문서를 보여준다", async () => {
  const html = await readOutput("404.html");

  assert.ok(html.includes("없는 문서를 발견하셨습니다"));
  // 막다른 길이 되지 않도록 다음 행동을 준다
  assert.ok(html.includes('href="/wiki/search/"'));
  assert.ok(html.includes('href="/wiki/"'));
  assert.ok(!html.includes("data-pagefind-body"), "404 는 검색 색인에서 빠져야 합니다");
});

test("검색엔진이 읽을 sitemap 과 robots 가 있다", async () => {
  const robots = await readOutput("robots.txt");
  assert.match(robots, /Sitemap: https:\/\/kimjeongjae\.com\/sitemap-index\.xml/);

  const sitemap = await readOutput("sitemap-0.xml");
  assert.ok(sitemap.includes("https://kimjeongjae.com/wiki/kimjeongjae/"), "문서가 sitemap 에 없습니다");
  assert.ok(!sitemap.includes("/wiki/search/"), "검색 페이지는 sitemap 에서 빼야 합니다");
});

test("링크를 공유할 때 제목과 설명이 보인다", async () => {
  const html = await readOutput("wiki/kimjeongjae/index.html");

  assert.ok(html.includes('property="og:title" content="김정재 - Kimjeongjae Wiki"'));
  assert.ok(html.includes('property="og:description"'));
  assert.ok(html.includes('property="og:url" content="https://kimjeongjae.com/wiki/kimjeongjae/"'));
  assert.ok(html.includes('name="twitter:card"'));
});
