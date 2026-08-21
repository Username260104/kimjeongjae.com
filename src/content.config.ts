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

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다.");

/** 대문 패널의 본문 종류. 편집기의 블록 하나에 대응한다. */
const portalPanelBody = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("prose"),
    paragraphs: z.array(richText),
    more: z.object({ label: z.string(), href: z.string() }).optional(),
  }),
  z.object({
    kind: z.literal("index"),
    entries: z.array(
      z.object({
        term: z.string(),
        description: z.string(),
        href: z.string().optional(),
      }),
    ),
  }),
  z.object({
    kind: z.literal("list"),
    items: z.array(z.string()),
  }),
  z.object({
    kind: z.literal("changes"),
    entries: z.array(z.object({ date: isoDate, summary: z.string() })),
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
    portal: z
      .object({
        panels: z.array(
          z.object({
            variant: z.enum(["featured", "explore", "facts", "changes"]),
            eyebrow: z.string(),
            heading: z.string(),
            slug: z.string(),
            body: portalPanelBody,
          }),
        ),
      })
      .optional(),
    notice: richText.optional(),
  }),
});

export const collections = { wiki };
