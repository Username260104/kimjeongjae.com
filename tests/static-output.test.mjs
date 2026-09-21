import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const readOutput = (path) =>
  readFile(new URL(`../dist/${path}`, import.meta.url), "utf8");

test("메인에는 사진과 명조체 문구만 표시된다", async () => {
  const html = await readOutput("index.html");
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1];

  assert.match(html, /<html\b[^>]*\blang="ko"/);
  assert.ok(body, "본문이 없습니다");
  assert.equal([...body.matchAll(/<img\b/g)].length, 1);
  assert.ok(body.includes('src="/images/main.jpg"'));
  assert.match(body, /<h1\b[^>]*aria-label="씨발"/);
  assert.equal(body.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").trim(), "씨발");
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
    ["CNAME", "index.html", "link-preview.png", "main.jpg", "noto-serif-kr-title.ttf", "OFL.txt", "robots.txt", "sitemap-0.xml", "sitemap-index.xml"].sort(),
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
