import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
  }),
});

export const collections = { wiki };
