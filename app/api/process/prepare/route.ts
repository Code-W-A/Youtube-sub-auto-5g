import { NextResponse } from "next/server"
import { segmentsToSrt, transcribeFromYoutubeUrl } from "@/lib/providers/stt"
import { fetchPreferredCaptions, getVideoDetails } from "@/lib/providers/youtube"
import { sbvToSrt } from "@/lib/utils"
import { proofreadSrtPreserveTiming } from "@/lib/providers/translate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const preferredRegion = "iad1"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ error: "Unsupported content-type" }, { status: 415 })
    }

    const body = await request.json()
    const {
      youtubeUrl,
      title,
      metaTitle,
      metaDescription,
      sourceLanguage = "auto",
      forceStt = false,
      srtContent,
      sbvContent,
    } = body ?? {}

    let baseTitle = metaTitle || title || (youtubeUrl ? "YouTube video" : "Proiect")
    let baseDescription: string | undefined = metaDescription
    if (youtubeUrl) {
      const details = await getVideoDetails(youtubeUrl)
      if (details) {
        if (!baseTitle && details.title) baseTitle = details.title
        if (!baseDescription && details.description) baseDescription = details.description
      }
    }
    if (!baseDescription) baseDescription = "Descriere automată"

    // Prepare RO SRT
    let roSrt = ""
    let transcriptSource: "captions" | "stt" | "sample" | "uploaded" | undefined
    try {
      if (typeof srtContent === "string" && srtContent.trim().length > 0) {
        roSrt = srtContent
        transcriptSource = "uploaded"
      } else if (typeof sbvContent === "string" && sbvContent.trim().length > 0) {
        roSrt = sbvToSrt(sbvContent)
        transcriptSource = "uploaded"
      } else if (forceStt && youtubeUrl) {
        const segments = await transcribeFromYoutubeUrl(youtubeUrl)
        roSrt = segmentsToSrt(segments, (t) => t)
        transcriptSource = "stt"
      } else if (youtubeUrl) {
        const caps = await fetchPreferredCaptions(youtubeUrl, [sourceLanguage === "auto" ? "ro" : sourceLanguage, "ro", "en"])
        if (caps?.srt) {
          roSrt = caps.srt
          transcriptSource = "captions"
        } else {
          const segments = await transcribeFromYoutubeUrl(youtubeUrl)
          roSrt = segmentsToSrt(segments, (t) => t)
          transcriptSource = "stt"
        }
      } else {
        roSrt = `1\n00:00:01,000 --> 00:00:04,000\nBună ziua și bun venit la acest tutorial...\n`
        transcriptSource = "sample"
      }
    } catch {
      roSrt = `1\n00:00:01,000 --> 00:00:04,000\nBună ziua și bun venit la acest tutorial...\n`
      transcriptSource = "sample"
    }

    // Proofread RO
    roSrt = await proofreadSrtPreserveTiming(roSrt, "ro")

    return NextResponse.json({
      baseTitle,
      baseDescription,
      roSrt,
      transcriptSource,
    })
  } catch (error) {
    console.error("/api/process/prepare error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


