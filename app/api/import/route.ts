import { NextResponse } from "next/server"
import { createJob } from "@/lib/jobs"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""

    // Accept JSON payloads
    if (contentType.includes("application/json")) {
      const body = await request.json()
      const {
        youtubeUrl,
        filename,
        title,
        sourceLanguage = "auto",
        targetLanguages = [],
        generateSubtitles = true,
        generateTranslations = true,
      } = body ?? {}

      if (!youtubeUrl && !filename) {
        return NextResponse.json({ error: "Provide youtubeUrl or filename" }, { status: 400 })
      }

      const job = createJob({
        title: title || (youtubeUrl || filename || "Video"),
        source: youtubeUrl ? { kind: "youtube", url: youtubeUrl } : { kind: "upload", filename },
        sourceLanguage,
        targetLanguages,
        generateSubtitles,
        generateTranslations,
      })

      return NextResponse.json({ jobId: job.id }, { status: 201 })
    }

    return NextResponse.json({ error: "Unsupported content-type" }, { status: 415 })
  } catch (error) {
    console.error("/api/import error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


