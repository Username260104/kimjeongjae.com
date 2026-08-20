# Kimjeongjae Wiki 리서치 및 실행 계획

조사일: 2026-07-10  
작업명: `Kimjeongjae`  
제품 내 일반 명칭: `Wiki`  
수정된 목표: 실제 Wiki 엔진 운영보다 가벼운 정적 사이트 구조로, 공개 백과사전형 외형과 문서 경험을 모사한 개인 포트폴리오 Wiki를 구축한다.

## 핵심 결론

요구가 “다중 사용자가 편집하는 실제 Wiki”가 아니라 “나 혼자 수정하고 관리하는 Wiki형 포트폴리오”라면 MediaWiki는 기본 선택으로는 무겁다. PHP, DB, 계정, 권한, 백업, 보안 업데이트가 필요하고, 이는 포트폴리오 운영 목적에 비해 부담이 크다.

추천 방향은 `정적 Wiki 셸`이다. 화면은 Wiki처럼 만들고, 콘텐츠는 Markdown/MDX 파일로 관리하며, 빌드 시 HTML로 생성한다. 운영 서버에는 정적 파일만 올라가므로 DB, PHP, 관리자 로그인, 실시간 편집 백엔드가 필요 없다. 편집은 로컬 에디터나 GitHub에서 Markdown을 수정하고 배포하는 방식으로 충분하다.

기술 추천은 `Astro + MDX/Markdown + custom Wiki layout + Pagefind search`다. Astro는 콘텐츠 중심 사이트와 포트폴리오에 적합하고, Content Collections로 Markdown 문서와 메타데이터를 구조화할 수 있다. 공식 문서는 Astro가 content-rich websites, portfolios 등에 적합하고, Content Collections가 Markdown/MDX 문서를 조직, 검증, 조회하는 데 쓰인다고 설명한다. [Astro Why Astro](https://docs.astro.build/en/concepts/why-astro/), [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

## 결정 변경

기존 계획:

- MediaWiki 1.46.0 설치
- Vector 2022 스킨 적용
- Cite, TemplateStyles 등 확장 설치
- 계정/권한/DB/백업 운영

수정 계획:

- MediaWiki를 기본 구현에서 제외
- Astro 기반 정적 사이트로 Wiki UI 직접 구현
- Markdown/MDX 문서를 소스 오브 트루스로 사용
- Git commit history를 문서 이력처럼 활용
- 검색은 Pagefind 같은 정적 검색 인덱스로 처리
- 기본 배포는 GitHub Pages 사용

이 변경은 요구에 더 적합하다. 사용자는 “실제 Wiki로의 사용성”보다 “외형과 개인 관리 편의”를 원하고 있으므로, 서버형 Wiki 엔진의 장점보다 운영 부담이 더 크게 작용한다.

## 구현 옵션 비교

| 옵션 | 설명 | 장점 | 단점 | 적합도 |
| --- | --- | --- | --- | --- |
| MediaWiki 풀 설치 | MediaWiki + Vector 2022 + DB | 진짜 Wiki 기능, 진짜 스킨 | 운영 부담 큼, 보안/DB/업데이트 필요 | 낮음 |
| MediaWiki 라이트 | MediaWiki + SQLite + 읽기 전용 운영 | 실제 스킨 유지, DB 부담 완화 | PHP/업데이트/계정 관리는 여전히 필요 | 중간 |
| 정적 Wiki 셸 | Astro/Eleventy로 Wiki UI 구현 | 서버 없음, 관리 쉬움, 빠름, 배포 간단 | 실제 편집/토론/이력 기능은 모사해야 함 | 높음 |
| HTML 수작업 | 정적 HTML/CSS만 작성 | 가장 단순 | 문서가 늘면 반복 관리 지옥 | 낮음 |

결론: 기본안은 `정적 Wiki 셸`로 간다. MediaWiki는 “진짜 편집 시스템이 필요해지는 경우”의 후순위 대안으로 남긴다.

## 왜 정적 Wiki 셸이 맞는가

### 요구와 잘 맞는 점

- 혼자 관리하므로 실시간 편집 백엔드가 필요 없다.
- 포트폴리오는 자주 바뀌는 실시간 데이터가 아니라 문서형 콘텐츠다.
- 외형은 HTML/CSS 레이아웃으로 충분히 모사할 수 있다.
- 문서 간 링크, 카테고리, 인포박스, 각주, 목차는 빌드 타임에 생성 가능하다.
- Git 이력이 문서 변경 이력 역할을 할 수 있다.
- 정적 호스팅은 서버 관리 부담이 거의 없다.

### 포기하는 것

- 방문자가 브라우저에서 직접 편집하는 기능
- MediaWiki의 실제 토론 페이지
- MediaWiki의 실시간 최근 변경
- 템플릿 파서, Lua 모듈, 복잡한 Wiki 문법
- 관리자 로그인 기반 CMS

이 프로젝트에서는 이 기능들이 핵심이 아니다. 오히려 “보이는 Wiki다움”과 “혼자 관리하기 쉬움”이 핵심이다.

## 권장 기술 스택

### 기본안

- Framework: Astro
- Content: Markdown 또는 MDX
- Styling: custom CSS로 Vector 2022 계열 레이아웃 모사
- Search: Pagefind
- Deploy: GitHub Pages
- Versioning: Git

Astro는 기본적으로 콘텐츠 중심 웹사이트에 맞춰져 있고, Content Collections를 통해 Markdown/MDX 파일을 구조화할 수 있다. Content Collections는 로컬 Markdown, MDX, YAML, TOML, JSON 등에서 데이터를 가져올 수 있으며, 비교적 정적인 콘텐츠에는 build-time collections가 적합하다고 안내한다. [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)

Pagefind는 정적 사이트 빌드 후 생성된 HTML을 인덱싱하고, 별도 서버 컴포넌트 없이 정적 검색 번들을 만든다. [Pagefind Docs](https://pagefind.app/docs/)

GitHub Pages는 HTML/CSS/JavaScript 정적 파일을 저장소에서 직접 호스팅하거나 빌드 프로세스를 거쳐 배포할 수 있다. [GitHub Pages Docs](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)

Cloudflare Pages도 Git provider 연결 또는 prebuilt assets 업로드 방식으로 정적/풀스택 프로젝트를 배포할 수 있다. 필요하면 Pages Functions로 서버리스 기능을 나중에 붙일 수 있다. [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)

### 대안

Eleventy도 가능하다. Eleventy는 Markdown, HTML, Liquid, Nunjucks 등을 템플릿으로 받아 정적 HTML을 생성하고, `--serve`로 로컬 개발 서버를 띄울 수 있다. 더 단순한 정적 사이트에는 좋지만, 이 프로젝트는 인포박스, 문서 타입, 카테고리, 검색, 목차 등 구조화가 중요하므로 Astro의 Content Collections가 더 깔끔하다. [Eleventy Docs](https://www.11ty.dev/docs/)

## 외형 구현 전략

목표는 외부 백과사전 브랜드를 쓰지 않고, 익숙한 Wiki 문서 UI의 구조를 `Kimjeongjae` 자체 브랜딩으로 재현하는 것이다.

### 구현할 UI 요소

- 좌측 사이드바
- 상단 검색
- 문서 제목
- 문서 탭: `Article`, `Talk`
- 도구 탭: `Read`, `View source`, `View history`
- 목차
- 우측 인포박스
- 각주 영역
- 카테고리 링크
- 최근 변경처럼 보이는 대문 섹션
- maintenance box, hatnote, citation needed 스타일

### 실제 기능 매핑

| Wiki UI | 정적 구현 방식 |
| --- | --- |
| Search | Pagefind 정적 검색 |
| Article | 생성된 문서 페이지 |
| Talk | 정적 안내 페이지 또는 비활성 탭 |
| View source | GitHub의 해당 Markdown 파일 링크 |
| View history | GitHub commit history 링크 또는 정적 changelog |
| Edit | 비공개 관리용 GitHub edit 링크, 공개 UI에서는 숨김 또는 비활성 |
| Recent changes | 최근 수정일 frontmatter 또는 Git 기반 changelog로 생성 |
| Categories | frontmatter `categories`로 생성 |
| Infobox | MDX 컴포넌트 또는 frontmatter 기반 컴포넌트 |
| References | Markdown footnotes 또는 remark 플러그인 |

이 방식이면 방문자는 Wiki처럼 읽고 탐색하지만, 운영자는 Markdown 파일만 관리하면 된다.

## 콘텐츠 모델

문서는 `src/content/wiki/` 아래에 둔다.

예시 구조:

```text
src/
  content/
    wiki/
      main-page.mdx
      kimjeongjae.mdx
      projects/
        project-a.mdx
        project-b.mdx
      skills/
        frontend.mdx
      wiki/
        about.mdx
        disclaimer.mdx
        style-guide.mdx
  components/
    WikiShell.astro
    ArticleLayout.astro
    Infobox.astro
    References.astro
    CategoryLinks.astro
    PageTabs.astro
    Sidebar.astro
  styles/
    wiki.css
```

문서 frontmatter 초안:

```yaml
---
title: "김정재"
slug: "김정재"
type: "person"
description: "Kimjeongjae Wiki의 주요 문서"
categories:
  - People
  - Portfolio
aliases:
  - "Kim Jeongjae"
infobox:
  name: "김정재"
  role: "Developer"
  fields:
    - label: "Website"
      value: "kimjeongjae..."
updated: "2026-07-10"
status: "stable"
---
```

## 정보 구조

### 첫 화면

첫 화면은 랜딩 페이지가 아니라 Wiki 대문이어야 한다.

문서명:

- `Main Page` 또는 `대문`

구성:

- 오늘의 대표 문서: `김정재`
- 알고 계십니까: 짧은 프로젝트/기술 trivia
- 최근 변경: 최근 업데이트된 문서 목록
- 둘러보기: Projects, Skills, Timeline, Contact
- 분류: 웹 개발, UI, 자동화, 실험, 문서화

### 핵심 문서

- `김정재`
- `김정재의 프로젝트 목록`
- `연표`
- `기술 스택`
- `연락처`
- `Wiki:About`
- `Wiki:Disclaimer`
- `Wiki:Style guide`

### 프로젝트 문서 구조

- 개요
- 배경
- 기능
- 기술 구성
- 구현 과정
- 결과
- 관련 문서
- 외부 링크
- 각주

## 실행 계획

### 1. Astro 기반 외견 승인본

- 처음부터 Astro의 정적 출력으로 대문과 `김정재` 문서 작성
- 최소 Content Collection과 공통 `WikiShell` 구성
- 좌측 사이드바, 상단 검색 자리, 문서 탭, 목차, 인포박스 배치
- 데스크톱, 태블릿, 모바일에서 외형 확인
- 외견 승인 전에는 실제 검색, 전체 콘텐츠, 배포 기능을 구현하지 않음

상세 범위와 승인 기준은 [Kimjeongjae Wiki 외견 구현 계획](./wiki-visual-implementation-plan.md)에 정의한다.

### 2. 외견 승인

- 대문과 `김정재` 문서의 화면 구조를 기준 버전으로 확정
- 반응형 레이아웃, 브랜딩, 문서 밀도 승인
- 승인된 공통 셸을 유지한 채 콘텐츠 확장 단계로 전환

### 3. 콘텐츠 시스템 확장

- 릴리스 A에서 만든 `src/content/wiki` 컬렉션 확장
- 프로젝트와 일반 문서용 frontmatter 필드 추가
- categories, aliases, related 필드 확장
- 카테고리 페이지 자동 생성
- 관련 문서 링크 규칙 정의

### 4. 추가 Wiki 장치 구현

- `Hatnote`
- `MaintenanceBox`
- `CitationNeeded`
- `References`
- `CategoryLinks`

### 5. 검색과 이력 모사

- Pagefind 인덱스 생성
- 검색 UI를 Wiki 상단 검색처럼 스타일링
- `View source`는 GitHub Markdown 파일로 연결
- `View history`는 GitHub commit history 또는 정적 changelog로 연결
- `Talk`은 정적 안내 문서로 처리

### 6. 콘텐츠 시드 작성

- 대문
- `김정재`
- 대표 프로젝트 3개
- 기술 스택
- 연표
- 연락처
- `Wiki:About`
- `Wiki:Disclaimer`
- `Wiki:Style guide`

### 7. 배포

- GitHub Pages용 GitHub Actions 구성
- 빌드 명령 설정
- Pagefind 인덱싱을 빌드 후 단계에 추가
- 커스텀 도메인 연결 여부 결정
- 검색엔진 노출 범위 결정

## MVP 범위

MVP에 포함:

- 정적 Astro 사이트
- Wiki 외형 레이아웃
- Markdown/MDX 기반 문서 관리
- 대문
- `김정재` 문서
- 프로젝트 문서 3개
- 기술 스택 문서
- 연표 문서
- 연락처 문서
- About/Disclaimer/Style guide
- 인포박스
- 목차
- 각주
- 카테고리
- 정적 검색
- GitHub source/history 링크

MVP에서 제외:

- MediaWiki 설치
- DB
- PHP 서버
- 로그인
- 공개 편집
- 브라우저 내 CMS
- 실제 토론 기능
- 실시간 최근 변경
- 복잡한 Wiki 문법 파서

## 외형 동일성에 대한 판단

외형은 충분히 가깝게 만들 수 있다. 백엔드가 MediaWiki인지 여부는 사용자가 보는 화면의 상당 부분과 직접 관계가 없다. 문서 레이아웃, 사이드바, 탭, 목차, 인포박스, 각주, 카테고리, 폰트 크기, 여백, 링크 색, 표 스타일을 잘 맞추면 사용자는 Wiki 경험으로 인식한다.

다만 실제 Vector 스킨 코드를 그대로 가져오는 것은 별도 판단이 필요하다. Wikimedia의 Vector skin 저장소는 GPL-2.0 license로 표시되어 있으므로, 코드를 직접 재사용하면 라이선스 의무를 검토해야 한다. [Vector Skin Repository](https://github.com/wikimedia/mediawiki-skins-Vector)

권장 방식은 “Vector 코드를 복사”가 아니라 “Wiki 문서 UI를 참고하여 Kimjeongjae용 CSS로 재작성”이다. 그래야 브랜딩, 라이선스, 유지보수 측면에서 깔끔하다.

## 법적/브랜드 가드레일

이 문서는 법률 자문이 아니라 구현 리스크 정리다.

권장:

- 사이트명, 로고, favicon, wordmark는 완전히 자체 제작한다.
- 제품 안의 일반 명칭은 `Wiki`로 통일한다.
- 외부 백과사전 서비스의 이름, 로고, 워드마크, 고유 아이콘을 사이트 브랜드처럼 쓰지 않는다.
- 푸터와 `Wiki:Disclaimer`에 개인 포트폴리오 Wiki임을 명시한다.
- 콘텐츠는 직접 작성한다.
- 외부 템플릿이나 스킨 코드를 그대로 복사하지 않고 필요한 UI만 직접 재작성한다.

주의:

- Wikimedia 상표 정책은 특정 문서/메인 페이지의 look and feel이 trade dress로 보호될 수 있다고 설명한다.
- 정책은 satire/parody 표기가 혼동 방지에 도움이 된다고 안내한다.
- 외부 백과사전 본문을 가져오면 CC BY-SA 4.0/GFDL 등 라이선스와 attribution 조건을 검토해야 한다. 포트폴리오 본문은 직접 작성하는 편이 안전하다. [Wikimedia Trademark Policy](https://foundation.wikimedia.org/wiki/Policy:Trademark_policy), [Wikimedia Terms of Use](https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use)

푸터 문구 초안:

> Kimjeongjae is a personal portfolio Wiki. This site is independently maintained and is not affiliated with or endorsed by any external encyclopedia project or foundation.

## 확정된 구현 결정

- Astro 정적 출력으로 바로 구현
- 문서 URL은 `/wiki/kimjeongjae/`
- 메인 문서 제목은 `김정재`
- 본문은 한국어 중심, 고유명사와 기술명만 영어 병기
- `View source`와 `View history`는 저장소 공개 후 GitHub 링크로 연결
- 현대적인 Wiki 레이아웃과 고전적인 백과사전 조판을 결합
- 별도 로고 없이 `Kimjeongjae Wiki` 텍스트 워드마크만 사용

콘텐츠 단계에서 정할 항목은 첫 프로젝트 3개와 실제 프로필 이미지다.

## 다음 작업 제안

다음 단계는 작업공간을 하나의 Astro 정적 프로젝트로 정리하고 `대문`과 `김정재` 문서만 있는 외견 승인본을 만드는 것이다. 브라우저에서 외형을 승인한 다음 카테고리, 검색, 프로젝트 문서와 배포를 확장한다. 상세 검토 결과는 [구현 계획 검토 보고서](./wiki-plan-review.md), 실행 기준은 [최종 구현 계획](./wiki-visual-implementation-plan.md)에 정리한다.

## 참고 자료

- Astro Why Astro: https://docs.astro.build/en/concepts/why-astro/
- Astro Content Collections: https://docs.astro.build/en/guides/content-collections/
- Eleventy Docs: https://www.11ty.dev/docs/
- Pagefind Docs: https://pagefind.app/docs/
- GitHub Pages Docs: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Vector 2022 skin: https://www.mediawiki.org/wiki/Skin:Vector/2022
- Vector Skin Repository: https://github.com/wikimedia/mediawiki-skins-Vector
- Wikimedia Foundation Trademark Policy: https://foundation.wikimedia.org/wiki/Policy:Trademark_policy
- Wikimedia Foundation Terms of Use: https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use
