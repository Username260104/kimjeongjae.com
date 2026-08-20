# Kimjeongjae Wiki 최종 구현 계획

작성일: 2026-07-10  
상태: 릴리스 A 구현 완료, 외견 승인 대기  
작업명: `Kimjeongjae`  
사이트명: `Kimjeongjae Wiki`

## 1. 최종 결정

`Kimjeongjae Wiki`는 MediaWiki나 서버 애플리케이션이 아니라 Astro의 정적 출력으로 구현한다.

- 프레임워크: Astro
- 렌더링: 빌드 시 생성되는 정적 HTML
- 콘텐츠: Markdown과 frontmatter
- 스타일: 자체 작성 CSS
- 클라이언트 동작: 모바일 메뉴 등 필요한 부분에만 최소 사용
- 검색: 외견 승인과 콘텐츠 확장 후 Pagefind 추가
- 배포: GitHub Pages
- 데이터베이스, 로그인, PHP, SSR, API: 사용하지 않음

Astro는 기본 출력이 `static`이며, 서버 렌더링을 선택하지 않은 페이지는 빌드 시 HTML로 생성된다. 따라서 Astro를 처음부터 사용해도 운영 백엔드가 생기는 것은 아니다. [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/#output)

별도의 순수 HTML 프로토타입을 만든 뒤 Astro로 이전하는 단계는 폐기한다. 처음부터 최종 구조 안에서 `대문`과 `김정재` 두 화면만 만들고, 외견이 승인될 때까지 기능과 문서 수를 늘리지 않는다.

## 2. 확정된 제품 방향

- 기준 외형: 현대적인 Wiki 레이아웃과 고전적인 백과사전 조판의 조합
- 언어: 한국어 중심, 고유명사와 기술명만 영어 병기
- 브랜딩: 별도 로고 없이 `Kimjeongjae Wiki` 텍스트 워드마크만 사용
- 대문 URL: `/`
- 인물 문서 URL: `/wiki/kimjeongjae/`
- 문서 표시 제목: `김정재`
- 일반 명칭: 모든 안내 문구에서 `Wiki` 사용
- 편집 방식: 최종적으로 로컬 또는 GitHub에서 Markdown 수정

구현 착수 전에 추가로 선택해야 할 기술 항목은 없다. 실제 인물 정보, 프로젝트명, 프로필 이미지 같은 콘텐츠만 별도로 채우면 된다.

## 3. 단계 구분

전체 작업을 두 개의 릴리스로 분리한다.

### 릴리스 A: 외견 승인본

이번에 먼저 구현할 범위다.

- Astro 정적 프로젝트
- 대문과 `김정재` 문서
- Wiki 공통 셸
- 실제 길이와 비슷한 한국어 초안 콘텐츠
- 데스크톱, 태블릿, 모바일 대응
- 두 페이지와 본문 목차 링크
- 비활성 검색, 토론, 원본, 역사 UI
- 브라우저 시각 검증

### 릴리스 B: 운영 가능한 포트폴리오

외견 승인 후 별도로 진행한다.

- 프로젝트, 기술, 연표, 연락처 문서
- 콘텐츠 스키마 확장
- 카테고리와 관련 문서
- Pagefind 검색
- GitHub 원본 및 변경 이력 링크
- 실제 이미지와 프로젝트 자료
- GitHub Pages 배포

릴리스 A 승인 전에는 릴리스 B를 구현하지 않는다.

## 4. 작업공간 정리

현재 루트는 Git 저장소가 아니고, 중단된 초기화 작업으로 생성된 `site/` 안에 별도 Git 저장소와 Next/React/Drizzle 기반 starter가 있다. 이 구조는 최종 기술 선택과 맞지 않는다.

구현 시작 시 다음 순서로 정리한다.

1. `site/` starter가 사용자 코드를 포함하지 않는지 다시 확인한다.
2. 사용하지 않을 `site/`와 그 안의 `node_modules`, 중첩 `.git`을 제거한다.
3. 현재 작업공간 루트를 하나의 Git 저장소이자 Astro 프로젝트 루트로 사용한다.
4. 기존 `docs/`는 그대로 보존한다.
5. Astro의 정적 출력만 설정하고 서버 adapter는 설치하지 않는다.

이 정리가 완료되어야 문서, 사이트 코드, 변경 이력이 한 저장소에서 관리된다.

## 5. 기술 구성

릴리스 A의 의존성은 다음 정도로 제한한다.

- `astro`: 정적 페이지 생성
- `lucide-astro`: 메뉴, 검색, 외부 링크처럼 익숙한 아이콘
- Astro 기본 TypeScript 지원

사용하지 않는 항목:

- React, Vue, Svelte
- Next.js 또는 Vinext
- Tailwind CSS
- Drizzle과 데이터베이스 패키지
- Cloudflare Worker adapter
- 인증과 상태 관리 라이브러리

Pagefind는 릴리스 B에서 개발 의존성으로 추가한다. Pagefind는 정적 사이트가 빌드된 뒤 결과 HTML을 인덱싱하므로, 두 문서의 외견을 만드는 단계에 먼저 넣을 이유가 없다. [Pagefind Getting Started](https://pagefind.app/docs/)

## 6. 파일 구조

```text
docs/
  wiki-portfolio-research.md
  wiki-plan-review.md
  wiki-visual-implementation-plan.md
src/
  components/
    SiteHeader.astro
    Sidebar.astro
    PageChrome.astro
    TableOfContents.astro
    Infobox.astro
    CategoryLinks.astro
    SiteFooter.astro
  content/
    wiki/
      main-page.md
      kimjeongjae.md
  layouts/
    WikiShell.astro
    ArticleLayout.astro
  pages/
    index.astro
    wiki/
      [...id].astro
  styles/
    wiki.css
  content.config.ts
astro.config.mjs
package.json
tsconfig.json
```

처음에는 CSS를 `wiki.css` 하나로 유지한다. 실제로 파일이 커지기 전까지 토큰, 반응형, 문서 스타일을 여러 파일로 나누지 않는다.

## 7. 콘텐츠 구조

두 문서도 처음부터 Astro Content Collection으로 읽는다. 외견 승인 후 Markdown 파일을 다시 옮길 필요가 없고, 같은 레이아웃으로 문서를 늘릴 수 있기 때문이다. Astro는 build-time collection과 `getStaticPaths()`를 이용해 각 문서를 정적 경로로 생성할 수 있다. [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

초기 frontmatter 필드:

```yaml
title: "김정재"
description: "Kimjeongjae Wiki의 주요 문서"
updated: 2026-07-10
type: "person"
categories:
  - "인물"
  - "포트폴리오"
aliases:
  - "Kim Jeongjae"
infobox:
  heading: "김정재"
  fields:
    - label: "분야"
      value: "Software, Design"
```

파일 ID를 URL에 사용한다. `kimjeongjae.md`는 `/wiki/kimjeongjae/`가 되고, 화면에는 frontmatter의 `title`인 `김정재`를 표시한다. 한글 표시와 안정적인 ASCII URL을 분리하는 방식이다.

## 8. 화면 구조

### 공통 헤더

- 메뉴 아이콘
- `Kimjeongjae Wiki` 워드마크
- 검색 입력과 검색 버튼의 외견
- 화면 폭이 좁을 때 검색 아이콘 모드

별도 심볼이나 로고는 두지 않고 텍스트 워드마크만 사용한다. 아이콘 버튼에는 Lucide 아이콘과 접근 가능한 이름을 사용한다.

### 좌측 탐색

- 대문
- 김정재
- 프로젝트
- 기술 스택
- 연표
- 연락처
- Wiki 소개

릴리스 A에서는 대문과 김정재만 링크로 제공한다. 아직 없는 문서는 링크처럼 보이는 가짜 `<a>`가 아니라 비활성 텍스트로 표현한다.

### 문서 상단

- 문서 제목
- 짧은 설명 또는 동음이의 안내 스타일 문장
- 마지막 수정일
- `문서`, `토론`
- `읽기`, `원본 보기`, `역사 보기`

이 UI는 동적인 탭 컴포넌트가 아니라 페이지 탐색 모양이다. 현재 항목은 텍스트로 표시하고, 없는 기능도 포커스를 받는 가짜 링크로 만들지 않는다. `href`가 있는 링크에 `aria-disabled`만 추가하면 실제 동작은 막히지 않으므로 사용하지 않는다. [W3C ARIA in HTML](https://www.w3.org/TR/html-aria/)

### 대문

대문은 랜딩 페이지가 아니라 Wiki 문서로 보이게 한다.

- `Kimjeongjae Wiki에 오신 것을 환영합니다`
- 대표 문서: 김정재
- 둘러보기: 프로젝트, 기술, 연표, 연락처
- 알고 계십니까
- 최근 변경
- 주요 분류

구획은 마케팅 카드가 아니라 얇은 경계선과 작은 제목 막대를 가진 문서 섹션으로 만든다.

### `김정재` 문서

- 백과사전식 첫 문단
- 정보상자
- 목차
- 개요
- 경력
- 대표 프로젝트
- 작업 방식
- 기술
- 각주
- 외부 링크
- 분류

프로젝트 표에는 긴 프로젝트명, 여러 역할, 긴 URL을 포함해 실제 레이아웃 한계를 검증한다. 의미 없는 lorem ipsum은 사용하지 않는다.

## 9. 레이아웃 규칙

기존 계획의 `1200px 이상 3열 + 중앙 900px` 조합은 좌우 탐색과 간격을 더하면 화면 폭을 초과한다. 다음처럼 실제 폭에 맞춰 수정한다.

### 1360px 이상

- 3열: 좌측 탐색 176px / 중앙 최대 900px / 우측 목차 196px
- 열 간격 24px
- 전체 콘텐츠 최대 폭 약 1352px
- 좌우 탐색과 목차는 긴 문서에서 sticky 처리

### 960~1359px

- 2열: 좌측 탐색 176px / 중앙 `minmax(0, 1fr)`
- 우측 목차는 본문 상단 목차로 이동
- 중앙 영역 최대 폭 960px

### 959px 이하

- 단일 열
- 좌측 탐색은 상단의 네이티브 `<details>` 메뉴로 전환
- 우측 목차는 본문 내부에 유지
- 별도 JavaScript 없이 키보드와 터치로 메뉴 사용 가능

### 정보상자 규칙

- 문서 콘텐츠 폭이 820px 이상일 때만 300px 너비로 우측 배치
- 그보다 좁으면 첫 문단 다음에 전체 폭으로 배치
- 뷰포트가 아니라 문서 컨테이너 폭을 기준으로 전환
- 긴 단어와 URL에는 줄바꿈 규칙 적용

### 모바일 규칙

- 문서 탭은 가로 스크롤 대신 우선순위가 낮은 항목을 숨겨 한 줄 유지
- 표만 자체 가로 스크롤 허용
- 페이지 전체의 가로 스크롤은 금지
- 본문 글자 크기는 과도하게 축소하지 않음
- 정보상자, 각주, 분류는 문서 흐름 안에서 전체 폭 사용

## 10. 시각 기준

| 항목 | 기준 |
| --- | --- |
| 본문색 | `#202122` 계열 |
| 보조색 | `#54595d` 계열 |
| 링크 | `#3366cc` 계열 |
| 방문 링크 | 링크와 구분되는 자주색 계열 |
| 경계선 | `#a2a9b1` 계열, 1px |
| 보조 배경 | `#f8f9fa` 계열 |
| 제목 | 세리프 계열, 음수 자간 사용 안 함 |
| UI와 본문 | 한국어 시스템 산세리프 계열 |
| 모서리 | 0~4px |
| 그림자 | 기본적으로 사용하지 않음 |

초기 버전은 시스템 글꼴로 구현한다. 시각 검토에서 한글 조판 차이가 크다고 판단될 때만 오픈 라이선스 한글 글꼴을 자체 호스팅한다.

## 11. 이미지와 브랜딩 자산

- 별도 로고와 브랜드 심볼은 제작하지 않음
- 헤더에는 `Kimjeongjae Wiki` 텍스트 워드마크만 사용
- 외부 백과사전의 로고, 퍼즐 지구, 워드마크 사용 금지
- 프로필 이미지를 받기 전에는 정보상자를 텍스트 정보만으로 구성
- 실제 공개 버전에는 사용자 제공 프로필 이미지 또는 대표 프로젝트 화면을 최소 1개 포함
- 이미지는 WebP 또는 AVIF로 최적화하고 구체적인 대체 텍스트 제공

푸터에는 개인 포트폴리오 Wiki이며 외부 백과사전 프로젝트와 무관하다는 면책 문구를 넣는다.

## 12. 릴리스 A 구현 순서

### 1. 작업공간 정리

- 불필요한 starter 제거
- 루트 Git 저장소와 Astro 정적 프로젝트 구성
- 기본 빌드 확인

완료 조건: 서버 adapter 없이 빈 정적 페이지가 빌드된다.

### 2. 콘텐츠 계약

- Wiki collection schema 작성
- 대문과 `김정재` Markdown 작성
- `/`와 `/wiki/kimjeongjae/` 경로 생성

완료 조건: 두 경로가 같은 문서 셸을 사용해 정적 HTML로 출력된다.

### 3. 공통 Wiki 셸

- 헤더, 좌측 탐색, 문서 상단, 우측 목차, 푸터 구현
- 기본 시각 토큰과 조판 적용
- 현재 경로와 비활성 항목 상태 구분

완료 조건: 첫 화면에서 `Kimjeongjae Wiki` 브랜드와 Wiki 문서 구조가 동시에 인식된다.

### 4. 문서 장치

- 정보상자
- 본문 목차
- 표
- 각주
- 분류
- 대문 구획

완료 조건: 실제 길이의 한국어 초안에서도 레이아웃이 유지된다.

### 5. 반응형 구현

- 3열, 2열, 단일 열 전환
- 정보상자 container 기반 재배치
- 모바일 메뉴와 표 overflow 처리

완료 조건: 기준 화면에서 요소 겹침과 페이지 가로 스크롤이 없다.

### 6. 검증과 외견 승인

- 정적 production build
- 데스크톱과 모바일 브라우저 확인
- 키보드 탐색과 포커스 확인
- 긴 제목, 긴 URL, 비어 있는 이미지, 넓은 표 확인
- 두 화면 스크린샷 비교

완료 조건: 아래 검증 기준을 모두 통과하고 사용자가 외견을 승인한다.

## 13. 검증 기준

기준 화면:

- 1440x900
- 1024x768
- 390x844

필수 통과 항목:

- `/`와 `/wiki/kimjeongjae/`가 production build에 포함된다.
- 운영 결과물에 데이터베이스와 서버 런타임이 필요 없다.
- 브라우저 콘솔 오류가 없다.
- 페이지 `scrollWidth`가 viewport 너비를 초과하지 않는다.
- 헤더, 탐색, 탭, 정보상자, 목차가 겹치지 않는다.
- 키보드 포커스가 항상 보인다.
- 링크와 일반 텍스트를 색상 외의 상태로도 구분할 수 있다.
- 비활성 기능은 클릭되거나 포커스를 받는 가짜 링크가 아니다.
- `<html lang="ko">`, 제목, 설명, canonical metadata가 설정된다.
- 외부 백과사전의 이름과 브랜드 자산이 없다.
- 사용자 제공 콘텐츠가 없어도 placeholder가 레이아웃을 깨지 않는다.

## 14. 릴리스 B 순서

외견 승인 후 다음 순서로 확장한다.

1. 실제 김정재 소개와 프로젝트 자료 반영
2. 프로젝트 3개, 기술 스택, 연표, 연락처 문서 추가
3. 카테고리와 관련 문서 자동 생성
4. Pagefind를 production build 이후 실행하도록 구성
5. GitHub 저장소가 공개된 경우 원본 보기와 역사 보기 연결
6. About, Disclaimer, Style guide 작성
7. GitHub Actions에서 `astro build` 후 Pagefind로 `dist/`를 인덱싱하고 GitHub Pages에 배포
8. 검색엔진 노출과 소셜 공유 metadata 검증

GitHub Pages 설정 시 최종 공개 URL에 맞춰 Astro의 `site`와 `base`를 함께 설정한다. 사용자 사이트 또는 커스텀 도메인은 `base: '/'`를 사용하고, 프로젝트 사이트는 저장소 이름을 base path로 반영한다. 커스텀 도메인은 최초 배포가 안정화된 뒤 연결한다.

## 15. 최종 완료 조건

- 운영자는 Markdown 파일만 수정하면 된다.
- 문서 추가 시 공통 레이아웃을 복사하지 않는다.
- 빌드 결과는 정적 파일이며 별도 서버 관리가 없다.
- 대문, 인물, 프로젝트, 기술, 연표, 연락처 문서가 연결된다.
- 검색은 빌드 후 생성된 정적 인덱스로 동작한다.
- 원본과 이력 링크는 Git 저장소를 사용한다.
- 화면은 Wiki 패러디로 인식되지만 외부 서비스의 브랜드로 오해되지 않는다.
