import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  const cookie = request.cookies.get("iam_admin");
  return cookie?.value === "1";
}

async function ghRequest(path: string, token: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/JohnBuck005/iammovies/contents/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      ...(init?.headers || {}),
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${path} failed: ${res.status} ${text}`);
  return init?.method ? JSON.parse(text) : JSON.parse(text);
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const seriesId = String(body?.seriesId ?? "");
    const episodeNumber = Number(body?.episodeNumber ?? "");
    const title = String(body?.title ?? "").trim();
    const duration = String(body?.duration ?? "").trim();
    const videoUrl = String(body?.videoUrl ?? "").trim();
    const thumbnailUrl = String(body?.thumbnailUrl ?? "").trim();
    const coverUrl = String(body?.coverUrl ?? "").trim();

    if (!seriesId || !Number.isFinite(episodeNumber) || episodeNumber < 1) {
      return NextResponse.json({ error: "seriesId and episodeNumber are required" }, { status: 400 });
    }
    if (!title || !duration) {
      return NextResponse.json({ error: "title and duration are required" }, { status: 400 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      return NextResponse.json({ error: "Server is missing GITHUB_TOKEN" }, { status: 500 });
    }

    const file = await ghRequest("src/data/series.ts", githubToken);
    let content = Buffer.from(file.content, "base64").toString("utf-8");

    // Ensure episodeList exists for this series
    const episodeListHeader = `    episodeList: [`;
    if (!content.includes(`${seriesId},`)) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 });
    }

    const seriesStart = content.indexOf(`id: "${seriesId}"`);
    const nextSeriesStart = content.indexOf(`  },`, seriesStart + 1);
    const seriesBlock = content.slice(seriesStart, nextSeriesStart);

    if (!seriesBlock.includes(episodeListHeader)) {
      const descriptionMatch = seriesBlock.match(/(description: ".*?"),\n/);
      const insertAfter = descriptionMatch ? descriptionMatch.index + descriptionMatch[0].length : seriesBlock.length;
      const insert = `\n    ${episodeListHeader}\n      \n    ],`;
      content =
        content.slice(0, seriesStart + insertAfter) +
        insert +
        content.slice(seriesStart + insertAfter);
    }

    // Build episode entry
    const defaultThumb = `/images/episodes/${seriesId}-ep${episodeNumber}.jpg`;
    const thumb = thumbnailUrl || defaultThumb;
    const coverEntry = coverUrl ? `,\n      cover: "${coverUrl}"` : "";
    const episodeEntry = `      { number: ${episodeNumber}, title: "${title.replace(/"/g, '\\"')}", duration: "${duration}", videoUrl: "${videoUrl.replace(/"/g, '\\"')}", isFree: ${episodeNumber <= 5}, thumbnail: "${thumb}"${coverEntry} }`;

    // Find episodeList start/end within series
    const seriesStartNew = content.indexOf(`id: "${seriesId}"`);
    const nextSeriesStartNew = content.indexOf(`  },`, seriesStartNew + 1);
    const currentSeriesBlock = content.slice(seriesStartNew, nextSeriesStartNew);
    const listStart = content.indexOf(episodeListHeader, seriesStartNew);
    const listEnd = content.indexOf("    ],", listStart) + "    ],".length;

    let episodesList = content.slice(listStart, listEnd);

    const existingLine = new RegExp(`\\s*\\{ number: ${episodeNumber},`);
    if (existingLine.test(episodesList)) {
      episodesList = episodesList.replace(existingLine, `\n${episodeEntry}`);
    } else {
      episodesList = episodesList.replace("    ],", `\n${episodeEntry}\n    ],`);
    }

    content = content.slice(0, listStart) + episodesList + content.slice(listEnd);

    // Update episode count to max existing number in list vs requested
    const numbers = Array.from(episodesList.matchAll(/\{ number: (\d+),/g)).map((m) => Number(m[1]));
    const maxEp = Math.max(episodeNumber, ...numbers);
    const episodesCountRegex = new RegExp(`(id: "${seriesId.replace(/"/g, '\\"')}",[\\s\\S]*?episodes: )(\\d+)`);
    if (episodesCountRegex.test(content)) {
      content = content.replace(episodesCountRegex, `$1${maxEp}`);
    }

    const commit = await ghRequest("src/data/series.ts", githubToken, {
      method: "PUT",
      body: JSON.stringify({
        message: `Add ${seriesId} Ep ${episodeNumber}: ${title}`,
        content: Buffer.from(content, "utf-8").toString("base64"),
        sha: file.sha,
      }),
    });

    return NextResponse.json({
      ok: true,
      commitUrl: commit.commit.html_url,
      episode: {
        seriesId,
        episodeNumber,
        title,
        duration,
        videoUrl,
        thumbnailUrl: thumb,
        coverUrl: coverUrl || null,
      },
    });
  } catch (e: any) {
    console.error("Upload failed:", e);
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
