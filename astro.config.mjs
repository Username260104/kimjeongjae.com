import { defineConfig } from "astro/config";
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

export default defineConfig({
  site: "https://kimjeongjae.com",
  output: "static",
  // 편집기 API(`/api/keystatic/...`)는 끝에 슬래시 없이 호출되므로
  // 개발 서버에서만 규칙을 완화한다. 공개 빌드는 기존과 같이 "always" 를 유지한다.
  trailingSlash: isDevServer ? "ignore" : "always",
  integrations: isDevServer ? [react(), keystatic()] : [],
});
