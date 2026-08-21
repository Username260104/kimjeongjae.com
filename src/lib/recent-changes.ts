import { execFileSync } from "node:child_process";
import { getCollection } from "astro:content";

/**
 * 최근 변경 목록을 Git 기록에서 만든다.
 *
 * - 문서 파일(src/content/wiki)을 건드린 커밋만 센다. 스타일이나 빌드 설정 변경은 제외된다.
 * - 커밋 메시지는 사용하지 않고 "어떤 문서가 어떻게 바뀌었는지"만 표시한다.
 * - 아직 커밋하지 않은 편집은 나타나지 않는다. 변경 "이력"이므로 의도된 동작이다.
 */

const CONTENT_DIR = "src/content/wiki";

/** git log 출력에서 커밋 줄을 구분하는 표시 (git 의 %x01 과 짝) */
const COMMIT_MARK = "\u0001";

export interface RecentChange {
  /** YYYY-MM-DD */
  date: string;
  /** 화면에 보여줄 날짜 */
  label: string;
  /** 문서 제목 */
  title: string;
  /** 문서 주소 */
  href: string;
  kind: "신규" | "수정";
}

const base = import.meta.env.BASE_URL;
const toPath = (path: string) => `${base}${path}`.replace(/\/+/g, "/");

export const formatDate = (iso: string) => {
  const [year, month, day] = iso.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

const git = (args: string[]) =>
  execFileSync("git", args, {
    encoding: "utf8",
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "ignore"],
  });

/** 파일 경로에서 문서 id 를 얻는다. `src/content/wiki/kimjeongjae.md` -> `kimjeongjae` */
const toDocumentId = (filePath: string) => {
  if (!filePath.startsWith(CONTENT_DIR + "/") || !filePath.endsWith(".md")) return undefined;
  return filePath.slice(CONTENT_DIR.length + 1, -".md".length);
};

interface RawChange {
  date: string;
  id: string;
  kind: RecentChange["kind"];
}

/** `git log` 출력을 문서별 변경 목록으로 읽는다. 최신 커밋이 앞에 온다. */
const readGitHistory = (): RawChange[] => {
  let output: string;
  try {
    output = git([
      "log",
      "--no-merges",
      "--date=short",
      "--pretty=format:%x01%ad",
      "--name-status",
      "--",
      CONTENT_DIR,
    ]);
  } catch {
    // Git 이 없거나 저장소가 아닌 환경에서는 조용히 비운다.
    return [];
  }

  const changes: RawChange[] = [];
  let date = "";

  for (const line of output.split("\n")) {
    if (line.startsWith(COMMIT_MARK)) {
      date = line.slice(COMMIT_MARK.length).trim();
      continue;
    }
    if (!line.trim() || !date) continue;

    const parts = line.split("\t");
    const status = parts[0]?.[0];
    // 이름이 바뀐 경우(R) 마지막 경로가 현재 이름이다.
    const filePath = parts[parts.length - 1];
    if (!status || !filePath) continue;

    const id = toDocumentId(filePath);
    if (!id) continue;

    changes.push({ date, id, kind: status === "A" ? "신규" : "수정" });
  }

  return changes;
};

/** 저장소가 얕게 복제되면 기록이 잘린다. 빌드 로그에 알린다. */
const warnIfShallow = () => {
  try {
    if (git(["rev-parse", "--is-shallow-repository"]).trim() === "true") {
      console.warn(
        "[recent-changes] Git 기록이 얕게 복제되어 최근 변경이 일부만 표시됩니다. " +
          "CI 에서는 actions/checkout 의 fetch-depth 를 0 으로 두세요.",
      );
    }
  } catch {
    /* 확인할 수 없으면 넘어간다 */
  }
};

export async function getRecentChanges(limit?: number): Promise<RecentChange[]> {
  warnIfShallow();

  const entries = await getCollection("wiki");
  const documents = new Map(entries.map((entry) => [entry.id, entry]));

  const seen = new Set<string>();
  const results: RecentChange[] = [];

  for (const change of readGitHistory()) {
    const document = documents.get(change.id);
    // 지금은 없는 문서(삭제됨)는 제목을 알 수 없으므로 표시하지 않는다.
    if (!document) continue;

    // 같은 문서가 하루에 여러 번 바뀌었으면 한 줄로 묶는다.
    const key = `${change.date}|${change.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    results.push({
      date: change.date,
      label: formatDate(change.date),
      title: document.data.title,
      href: change.id === "main-page" ? toPath("") : toPath(`wiki/${change.id}/`),
      kind: change.kind,
    });

    if (limit !== undefined && results.length >= limit) break;
  }

  return results;
}
