import { getCollection, type CollectionEntry } from "astro:content";

/** 문서 목록, 분류, 주소 계산을 한곳에서 다룬다. */

export type WikiEntry = CollectionEntry<"wiki">;

const base = import.meta.env.BASE_URL;
const toPath = (path: string) => `${base}${path}`.replace(/\/+/g, "/");

/** 대문은 사이트 루트에, 나머지 문서는 /wiki/{id}/ 에 놓인다. */
export const documentHref = (id: string) =>
  id === "main-page" ? toPath("") : toPath(`wiki/${id}/`);

/** 분류 이름을 주소에 쓸 수 있는 형태로 바꾼다. 공백만 하이픈으로 바꾼다. */
export const categorySlug = (name: string) => name.trim().replace(/\s+/g, "-");

export const categoryHref = (name: string) =>
  toPath(`wiki/category/${categorySlug(name)}/`);

export const allDocumentsHref = toPath("wiki/");
export const recentChangesHref = toPath("wiki/recent-changes/");
export const searchHref = toPath("wiki/search/");

const collator = new Intl.Collator("ko");

/** 모든 문서를 제목 가나다순으로 돌려준다. */
export async function getDocuments(): Promise<WikiEntry[]> {
  const entries = await getCollection("wiki");
  return entries.sort((a, b) => collator.compare(a.data.title, b.data.title));
}

export interface CategorySummary {
  name: string;
  slug: string;
  href: string;
  count: number;
}

/** 문서에 쓰인 모든 분류를 문서 수와 함께 돌려준다. */
export async function getCategories(): Promise<CategorySummary[]> {
  const documents = await getDocuments();
  const counts = new Map<string, number>();

  for (const document of documents) {
    for (const category of document.data.categories) {
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      slug: categorySlug(name),
      href: categoryHref(name),
      count,
    }))
    .sort((a, b) => collator.compare(a.name, b.name));
}

/** 해당 분류에 속한 문서를 돌려준다. */
export async function getDocumentsInCategory(name: string): Promise<WikiEntry[]> {
  const documents = await getDocuments();
  return documents.filter((document) => document.data.categories.includes(name));
}

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const formatUpdated = (date: Date) => dateFormatter.format(date);
