import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import keystatic from "@keystatic/astro";

/**
 * 편집기(Keystatic)는 로컬 개발 서버에서만 켠다.
 *
 * 편집기 화면은 서버에서 처리되는 라우트(prerender: false)를 필요로 하는데,
 * 공개 빌드는 어댑터 없는 순수 정적 출력이어야 GitHub Pages 에 배포할 수 있다.
 * 그래서 `astro build` 에서는 편집기 관련 통합을 아예 넣지 않는다.
 */
const isDevServer = process.argv[2] === "dev";

/**
 * 빌드가 끝난 정적 HTML을 읽어 검색 인덱스를 만든다.
 *
 * `astro build` 에 붙어 있으므로 CI가 어떤 명령으로 빌드하든 항상 함께 실행된다.
 * 개발 서버에는 인덱스가 없으므로 검색 확인은 `npm run preview` 로 한다.
 */
const pagefind = () => ({
  name: "pagefind",
  hooks: {
    "astro:build:done": async ({ dir, logger }) => {
      const outDir = fileURLToPath(dir);
      const pagefindModule = await import("pagefind");
      const { index } = await pagefindModule.createIndex();
      const { page_count: pageCount, errors } = await index.addDirectory({ path: outDir });
      await index.writeFiles({ outputPath: path.join(outDir, "pagefind") });
      await pagefindModule.close();

      if (errors.length > 0) {
        throw new Error(`검색 인덱스 생성 실패: ${errors.join(", ")}`);
      }
      logger.info(`검색 인덱스 생성 완료 (문서 ${pageCount}개)`);
    },
  },
});

export default defineConfig({
  site: "https://kimjeongjae.com",
  output: "static",
  // 편집기 API(`/api/keystatic/...`)는 끝에 슬래시 없이 호출되므로
  // 개발 서버에서만 규칙을 완화한다. 공개 빌드는 기존과 같이 "always" 를 유지한다.
  trailingSlash: isDevServer ? "ignore" : "always",
  integrations: [
    // 검색 결과 페이지는 그 자체로 검색될 이유가 없으므로 sitemap 에서 뺀다.
    sitemap({ filter: (page) => !page.includes("/wiki/search/") }),
    pagefind(),
    ...(isDevServer ? [react(), keystatic()] : []),
  ],
});
