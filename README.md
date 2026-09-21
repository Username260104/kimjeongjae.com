# Kimjeongjae

메인(`/`)에 사진과 검은색 명조체 문구를 표시하는 Astro 정적 사이트입니다.
문구는 사진 앞쪽에서 화면 중앙에 겹쳐 표시되며, 화면 너비에 맞춰 크기가 조절됩니다.
사진도 1280×720 화면에서의 360×480 배치를 기준으로 화면 너비와 높이에 맞춰 함께 줄어듭니다.

## 로컬 실행

```bash
npm ci
npm run dev
```

기본 주소는 `http://localhost:4321/`입니다.

## 파일

- `src/pages/index.astro`: 사진 메인
- `public/images/main.jpg`: 메인 사진
- `public/images/link-preview.png`: 내용이 없는 흰색 공유 미리보기 이미지
- `public/fonts/noto-serif-kr-title.ttf`: 문구용 Noto Serif KR Regular 글꼴
- `public/fonts/OFL.txt`: 글꼴의 SIL Open Font License
- `public/CNAME`: 공개 도메인
- `public/robots.txt`: 검색엔진 안내

사이트맵에는 메인 주소만 포함됩니다. 별도 하위 페이지는 제공하지 않습니다.

## 링크 미리보기

Open Graph와 Twitter Card에는 사이트 이름과 도메인, 흰색 이미지만 제공합니다.
검색엔진에는 본문·이미지 미리보기 및 페이지 이미지 색인 제외를 요청하고,
`robots.txt`에서 메인 사진의 수집을 제한합니다.
이 설정은 접근 제한이 아니며, 서비스 자체 화면 캡처나 이미 저장된 미리보기 캐시까지 차단하지는 못합니다.

## 검증

```bash
npm run check
npm test
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 빌드해 GitHub Pages에 배포합니다.
공개 주소는 `https://kimjeongjae.com`입니다.
