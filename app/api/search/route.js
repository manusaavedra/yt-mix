import { load } from "cheerio";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SEARCH_URL = "https://www.youtube.com/results";
const USER_AGENT =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

function extractYtInitialData(html) {
    const $ = load(html);
    let scriptContent = "";

    $("script").each((_, element) => {
        const content = $(element).html() || "";

        if (!scriptContent && content.includes("var ytInitialData =")) {
            scriptContent = content;
        }
    });

    if (!scriptContent) {
        return null;
    }

    const prefix = "var ytInitialData = ";
    const startIndex = scriptContent.indexOf(prefix);

    if (startIndex === -1) {
        return null;
    }

    const jsonStart = startIndex + prefix.length;
    let depth = 0;
    let inString = false;
    let escaped = false;
    let endIndex = -1;

    for (let index = jsonStart; index < scriptContent.length; index += 1) {
        const char = scriptContent[index];

        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }

            if (char === "\\") {
                escaped = true;
                continue;
            }

            if (char === "\"") {
                inString = false;
            }

            continue;
        }

        if (char === "\"") {
            inString = true;
            continue;
        }

        if (char === "{") {
            depth += 1;
            continue;
        }

        if (char === "}") {
            depth -= 1;

            if (depth === 0) {
                endIndex = index + 1;
                break;
            }
        }
    }

    if (endIndex === -1) {
        return null;
    }

    return JSON.parse(scriptContent.slice(jsonStart, endIndex));
}

function getVideoRenderers(data) {
    const sections =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

    return sections.flatMap((section) => {
        const items = section?.itemSectionRenderer?.contents || [];

        return items
            .map((item) => item?.videoRenderer)
            .filter(Boolean);
    });
}

function getText(value) {
    if (!value) {
        return "";
    }

    if (typeof value.simpleText === "string") {
        return value.simpleText;
    }

    if (Array.isArray(value.runs)) {
        return value.runs.map((item) => item.text || "").join("");
    }

    return "";
}

function toVideoItem(video) {
    const thumbnails = video?.thumbnail?.thumbnails || [];
    const mediumThumbnail = thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || "";

    return {
        id: {
            videoId: video.videoId
        },
        snippet: {
            title: getText(video.title),
            description: getText(video.descriptionSnippet),
            channelTitle: getText(video.ownerText),
            publishedAt: getText(video.publishedTimeText),
            thumbnails: {
                medium: {
                    url: mediumThumbnail
                }
            }
        }
    };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = String(searchParams.get("q") || "").trim();

    if (!query) {
        return NextResponse.json({ items: [] });
    }

    const url = `${SEARCH_URL}?${new URLSearchParams({ search_query: query }).toString()}`;

    try {
        const response = await fetch(url, {
            headers: {
                "accept-language": "es-ES,es;q=0.9,en;q=0.8",
                "user-agent": USER_AGENT
            },
            cache: "no-store"
        });

        if (!response.ok) {
            return NextResponse.json({ items: [] }, { status: response.status });
        }

        const html = await response.text();
        const data = extractYtInitialData(html);
        const items = getVideoRenderers(data).slice(0, 12).map(toVideoItem);

        return NextResponse.json({ items });
    } catch (error) {
        return NextResponse.json(
            {
                items: [],
                error: "Search failed"
            },
            { status: 500 }
        );
    }
}
