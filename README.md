# Kimjeongjae Wiki

Wiki 문서 외형으로 구성한 김정재의 정적 포트폴리오입니다. Astro가 Markdown 문서를 빌드 시 HTML로 생성하며, 데이터베이스와 서버 렌더링은 사용하지 않습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

기본 주소는 `http://localhost:4321/`입니다.

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
