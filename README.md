# Kimjeongjae Wiki

Wiki 문서 외형으로 구성한 김정재의 정적 포트폴리오입니다. Astro가 Markdown 문서를 빌드 시 HTML로 생성하며, 데이터베이스와 서버 렌더링은 사용하지 않습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:4321/`입니다.

## 문서 편집

```bash
npm run edit
```

브라우저에서 `http://localhost:4321/keystatic/` 을 열면 편집 화면이 나옵니다.
편집기는 내 컴퓨터에서만 동작하며, 저장하면 `src/content/wiki/` 의 문서 파일이 직접 수정됩니다.
공개 사이트에는 편집기가 포함되지 않습니다.

편집 대상은 `keystatic.config.ts` 에 정의합니다.
**이 설정에 없는 frontmatter 항목은 저장할 때 파일에서 삭제되므로,
`src/content.config.ts` 의 스키마와 항상 같은 항목을 유지해야 합니다.**

## 사이트 구조

| 주소 | 내용 |
| --- | --- |
| `/` | 대문 |
| `/wiki/` | 모든 문서 목록과 분류 색인 |
| `/wiki/{문서}/` | 문서 |
| `/wiki/category/{분류}/` | 분류별 문서 목록 |
| `/wiki/recent-changes/` | 변경 이력 |
| `/wiki/search/` | 검색 |

문서 목록, 분류 페이지, 사이드바 메뉴는 모두 `src/content/wiki` 의 문서에서 자동으로 만들어집니다
(`src/lib/wiki.ts`). 문서를 추가하면 목록과 분류에 저절로 나타나므로 메뉴를 따로 고치지 않습니다.

## 검색엔진 노출

- `sitemap-index.xml` / `sitemap-0.xml`: `@astrojs/sitemap` 이 빌드 때 생성합니다. 검색 결과 페이지는 제외합니다.
- `public/robots.txt`: sitemap 위치를 알립니다. **도메인이 바뀌면 이 파일도 함께 고쳐야 합니다.**
- 공유용 `og:` 태그는 `src/layouts/WikiShell.astro` 에서 문서 제목과 설명으로 만듭니다. 대표 이미지(`og:image`)는 아직 없습니다.
- 없는 주소는 `src/pages/404.astro` 가 받습니다.

## 검색

`astro build` 가 끝나면 Pagefind 가 정적 HTML을 읽어 검색 인덱스를 만듭니다
(설정은 `astro.config.mjs` 의 `pagefind` 통합).

- **개발 서버에는 인덱스가 없습니다.** 검색 확인은 `npm run build && npm run preview` 로 합니다.
- 목록·분류·검색처럼 자동 생성된 페이지는 색인에서 제외합니다. 무엇을 검색해도 걸려서 결과를 어지럽히기 때문입니다.
- 색인 대상은 `ArticleLayout` 의 `indexed` 값으로 정합니다.

## 최근 변경

대문의 `최근 변경` 패널과 `/wiki/recent-changes/` 페이지는 **Git 기록에서 자동으로 만들어집니다**
(`src/lib/recent-changes.ts`). 손으로 목록을 적지 않습니다.

- `src/content/wiki` 안의 문서 파일을 고친 커밋만 셉니다. 스타일과 빌드 설정 변경은 제외됩니다.
- 커밋 메시지는 사용하지 않고 "어떤 문서가 신규/수정되었는지"만 표시합니다.
- **아직 커밋하지 않은 편집은 나타나지 않습니다.** 변경 이력이므로 의도된 동작입니다.
- 배포 워크플로에서 `fetch-depth: 0` 이 필요합니다. 기본값이면 커밋 한 개만 받아 목록이 잘립니다.

편집기에서는 패널의 제목과 `보여줄 개수`만 정합니다.

## 검증

```bash
npm run check
npm test
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 정적 사이트를 빌드해 GitHub Pages에 배포합니다.
공개 주소는 `https://kimjeongjae.com`이며, 커스텀 도메인은 저장소의 **Settings → Pages**와 도메인 판매처의 DNS에서 함께 연결해야 합니다.

## 문서

- `src/content/wiki/main-page.md`: 대문
- `src/content/wiki/kimjeongjae.md`: 김정재 문서
- `docs/wiki-visual-implementation-plan.md`: 최종 구현 계획
- `docs/wiki-plan-review.md`: 구현 계획 검토 보고서
- `docs/wiki-feature-roadmap.md`: 기능 로드맵
