import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readOutput = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

const wordList = await readFile(
  new URL("../output/emotion-words/감정_단어_목록.md", import.meta.url),
  "utf8",
);
const words = wordList.trim().split(/\r?\n/).map((line) => line.slice(2));

test("감정 목록은 중복 없는 한글 단어 204개로 구성된다", () => {
  assert.equal(words.length, 204);
  assert.equal(new Set(words).size, words.length);
  assert.ok(words.every((word) => /^[가-힣]+(?: [가-힣]+)*$/.test(word)));
});

test("메인에는 사진과 감정 단어만 표시된다", async () => {
  const html = await readOutput("index.html");
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1];

  assert.match(html, /<html\b[^>]*\blang="ko"/);
  assert.ok(body, "본문이 없습니다");
  assert.equal([...body.matchAll(/<img\b/g)].length, 1);
  assert.ok(body.includes('src="/images/main.jpg"'));
  assert.match(body, new RegExp(`<h1\\b[^>]*aria-label="${words[0]}"`));
  const visibleBody = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
  assert.equal(visibleBody, words[0]);
  assert.doesNotMatch(body, /씨발/);
  const wordData = html.match(/<script\b[^>]*id="emotion-words"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(wordData, "전체 단어 목록이 페이지에 포함되어야 합니다");
  assert.deepEqual(JSON.parse(wordData), words);
  assert.doesNotMatch(body, /<(?:header|footer|nav|aside|a|button|input)\b/);
  const image = await readFile(new URL("../dist/images/main.jpg", import.meta.url));
  assert.ok(image.length > 0, "사진이 빌드 결과에 없습니다");
});

test("배포 결과에는 메인과 필요한 정적 파일만 남는다", async () => {
  const entries = await readdir(new URL("../dist/", import.meta.url), {
    recursive: true,
    withFileTypes: true,
  });

  assert.deepEqual(
    entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort(),
    ["CNAME", "favicon-python.png", "index.html", "link-preview.png", "main.jpg", "noto-serif-kr-title.ttf", "OFL.txt", "robots.txt", "sitemap-0.xml", "sitemap-index.xml"].sort(),
  );
  assert.deepEqual(
    entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort(),
    ["fonts", "images"],
  );
});

test("검색엔진에 메인 주소만 제공한다", async () => {
  const robots = await readOutput("robots.txt");
  assert.match(robots, /Sitemap: https:\/\/kimjeongjae\.com\/sitemap-index\.xml/);

  const sitemap = await readOutput("sitemap-0.xml");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls, ["https://kimjeongjae.com/"]);
});
