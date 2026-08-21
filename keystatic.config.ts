import { config, fields, singleton } from "@keystatic/core";

/**
 * 대문 편집기 설정.
 *
 * 주의: 여기에 없는 frontmatter 항목은 저장할 때 파일에서 삭제된다.
 * src/content.config.ts 의 스키마와 항상 같은 항목을 유지해야 한다.
 */

const richText = fields.object(
  {
    term: fields.text({
      label: "굵게 표시할 앞머리",
      description: "위키에서 표제어를 굵게 쓰는 관행용. 필요 없으면 비워 둡니다.",
    }),
    text: fields.text({ label: "문장", multiline: true }),
  },
  { label: "문단" },
);

/** 모든 패널이 공통으로 가지는 항목 */
const panelHeader = {
  variant: fields.select({
    label: "패널 스타일",
    description: "facts 를 고르면 머리 부분이 초록색이 됩니다.",
    options: [
      { label: "대표 (featured)", value: "featured" },
      { label: "둘러보기 (explore)", value: "explore" },
      { label: "짧은 기록 · 초록 머리 (facts)", value: "facts" },
      { label: "문서 기록 (changes)", value: "changes" },
    ],
    defaultValue: "explore",
  }),
  eyebrow: fields.text({ label: "작은 제목", description: "패널 맨 위 회색 글씨" }),
  heading: fields.text({ label: "패널 제목" }),
  slug: fields.text({
    label: "목차 연결 ID",
    description: "영문 소문자와 하이픈만 사용합니다. 목차의 slug 와 같아야 합니다.",
  }),
};

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Kimjeongjae Wiki" },
    navigation: { 문서: ["mainPage"] },
  },
  singletons: {
    mainPage: singleton({
      label: "대문",
      path: "src/content/wiki/main-page",
      format: { contentField: "content" },
      schema: {
        title: fields.text({ label: "문서 제목" }),
        description: fields.text({ label: "한 줄 설명" }),
        lead: fields.text({ label: "머리말", multiline: true }),
        updated: fields.date({ label: "마지막 수정" }),
        type: fields.select({
          label: "문서 종류",
          options: [
            { label: "대문", value: "main" },
            { label: "인물", value: "person" },
            { label: "프로젝트", value: "project" },
            { label: "일반 문서", value: "document" },
          ],
          defaultValue: "main",
        }),
        categories: fields.array(fields.text({ label: "분류" }), {
          label: "분류",
          itemLabel: (props) => props.value,
        }),
        aliases: fields.array(fields.text({ label: "다른 이름" }), {
          label: "다른 이름",
          itemLabel: (props) => props.value,
        }),
        toc: fields.array(
          fields.object({
            depth: fields.integer({ label: "단계", defaultValue: 2 }),
            slug: fields.text({ label: "연결 ID" }),
            text: fields.text({ label: "목차에 보일 글자" }),
          }),
          { label: "목차", itemLabel: (props) => props.fields.text.value },
        ),
        portal: fields.blocks(
          {
            prose: {
              label: "문단 패널",
              itemLabel: (props) => `문단 · ${props.fields.heading.value}`,
              schema: fields.object({
                ...panelHeader,
                paragraphs: fields.array(richText, {
                  label: "문단",
                  itemLabel: (props) => props.fields.text.value.slice(0, 24),
                }),
                more: fields.object(
                  {
                    label: fields.text({ label: "링크 글자", description: "비우면 링크가 표시되지 않습니다." }),
                    href: fields.text({ label: "링크 주소" }),
                  },
                  { label: "더 보기 링크" },
                ),
              }),
            },
            index: {
              label: "색인 패널",
              itemLabel: (props) => `색인 · ${props.fields.heading.value}`,
              schema: fields.object({
                ...panelHeader,
                entries: fields.array(
                  fields.object({
                    term: fields.text({ label: "항목" }),
                    description: fields.text({ label: "설명" }),
                    href: fields.text({ label: "링크 주소", description: "비우면 링크가 걸리지 않습니다." }),
                  }),
                  { label: "색인 항목", itemLabel: (props) => props.fields.term.value },
                ),
              }),
            },
            list: {
              label: "목록 패널",
              itemLabel: (props) => `목록 · ${props.fields.heading.value}`,
              schema: fields.object({
                ...panelHeader,
                items: fields.array(fields.text({ label: "항목", multiline: true }), {
                  label: "항목",
                  itemLabel: (props) => props.value.slice(0, 24),
                }),
              }),
            },
            changes: {
              label: "최근 변경 패널",
              itemLabel: (props) => `변경 · ${props.fields.heading.value}`,
              schema: fields.object({
                ...panelHeader,
                limit: fields.integer({
                  label: "보여줄 개수",
                  description:
                    "목록은 Git 기록에서 자동으로 만들어집니다. 여기서는 몇 개까지 보여줄지만 정합니다.",
                  defaultValue: 5,
                }),
              }),
            },
          },
          { label: "대문 패널" },
        ),
        notice: fields.object(
          {
            term: fields.text({ label: "굵게 표시할 앞머리" }),
            text: fields.text({ label: "안내 문구", multiline: true }),
          },
          { label: "하단 안내문" },
        ),
        content: fields.markdoc({
          label: "본문 (대문은 비워 둡니다)",
          extension: "md",
        }),
      },
    }),
  },
});
