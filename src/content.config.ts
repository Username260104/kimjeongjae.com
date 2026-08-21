import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/**
 * 표제어를 굵게 표시하는 위키 관행을 데이터로 표현한다.
 * term이 있으면 <strong>term</strong>text 로 렌더한다.
 */
const richText = z.object({
  term: z.string().optional(),
  text: z.string(),
});

/**
 * 대문 패널.
 *
 * `{ discriminant, value }` 모양은 편집기(Keystatic)의 블록 저장 형식이다.
 * 편집기 설정(keystatic.config.ts)과 짝을 이루므로 임의로 바꾸지 않는다.
 */
const panelHeader = {
  variant: z.enum(["featured", "explore", "facts", "changes"]),
  eyebrow: z.string(),
  heading: z.string(),
  slug: z.string(),
};

const linkField = z.object({ label: z.string(), href: z.string() }).optional();

const portalPanel = z.discriminatedUnion("discriminant", [
  z.object({
    discriminant: z.literal("prose"),
    value: z.object({
      ...panelHeader,
      paragraphs: z.array(richText),
      more: linkField,
    }),
  }),
  z.object({
    discriminant: z.literal("index"),
    value: z.object({
      ...panelHeader,
      entries: z.array(
        z.object({
          term: z.string(),
          description: z.string(),
          href: z.string().optional(),
        }),
      ),
    }),
  }),
  z.object({
    discriminant: z.literal("list"),
    value: z.object({ ...panelHeader, items: z.array(z.string()) }),
  }),
  // 최근 변경 목록은 Git 기록에서 자동으로 만든다(src/lib/recent-changes.ts).
  // 문서에는 "몇 개를 보여줄지"만 저장한다.
  z.object({
    discriminant: z.literal("changes"),
    value: z.object({
      ...panelHeader,
      limit: z.number().int().min(1).max(50).default(5),
    }),
  }),
]);

const wiki = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wiki" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    lead: z.string(),
    updated: z.coerce.date(),
    type: z.enum(["main", "person", "project", "document"]),
    categories: z.array(z.string()).default([]),
    aliases: z.array(z.string()).default([]),
    toc: z
      .array(
        z.object({
          depth: z.number().int().min(2).max(3),
          slug: z.string(),
          text: z.string(),
        }),
      )
      .optional(),
    infobox: z
      .object({
        heading: z.string(),
        caption: z.string().optional(),
        fields: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            href: z.string().optional(),
          }),
        ),
      })
      .optional(),
    portal: z.array(portalPanel).optional(),
    notice: richText.optional(),
  }),
});

export const collections = { wiki };
