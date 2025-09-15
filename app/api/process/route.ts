import { NextResponse } from "next/server"
import { segmentsToSrt, srtToVtt, transcribeFromYoutubeUrl } from "@/lib/providers/stt"
import { translateTitleAndDescription, translateSrtPreserveTiming } from "@/lib/providers/translate"
import { fetchPreferredCaptions, fetchCaptionsSrtFromTrack, getVideoDetails } from "@/lib/providers/youtube"
import { sbvToSrt } from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const preferredRegion = "iad1"

type ArtifactType = "subtitle-srt" | "subtitle-vtt" | "titles-descriptions"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

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
      sourceLanguage = "auto",
      targetLanguages = [],
      generateSubtitles = true,
      generateTranslations = true,
      forceStt = false,
      srtContent,
      sbvContent,
    } = body ?? {}

    if (!youtubeUrl && !srtContent && !sbvContent) {
      return NextResponse.json({ error: "Provide youtubeUrl, srtContent or sbvContent" }, { status: 400 })
    }

    let baseTitle = title || (youtubeUrl ? "YouTube video" : "Proiect")
    let baseDescription: string | undefined
    if (youtubeUrl) {
      const details = await getVideoDetails(youtubeUrl)
      if (details) {
        if (!title && details.title) baseTitle = details.title
        baseDescription = details.description
      }
    }

    // Prepare RO SRT
    let roSrt = ""
    let transcriptSource: "captions" | "stt" | "sample" | "uploaded" | undefined
    let selectedTrack: any = null
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
          selectedTrack = caps.track
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

    const roVtt = srtToVtt(roSrt)

    type OutArtifact = {
      language: string
      filename: string
      contentType: string
      type: ArtifactType
      sizeBytes: number
      content: string
    }

    const artifacts: OutArtifact[] = []
    const root = slugify(baseTitle)

    if (generateSubtitles) {
      artifacts.push({
        language: "ro",
        filename: `${root}_ro.srt`,
        contentType: "application/x-subrip",
        type: "subtitle-srt",
        sizeBytes: roSrt.length,
        content: roSrt,
      })
      artifacts.push({
        language: "ro",
        filename: `${root}_ro.vtt`,
        contentType: "text/vtt",
        type: "subtitle-vtt",
        sizeBytes: roVtt.length,
        content: roVtt,
      })
    }

    if (generateTranslations) {
      for (const lang of targetLanguages as string[]) {
        try {
          let srt: string | null = null
          if (selectedTrack && youtubeUrl) {
            try {
              srt = await fetchCaptionsSrtFromTrack(selectedTrack, lang)
            } catch {}
          }
          if (!srt) {
            srt = await translateSrtPreserveTiming(roSrt, lang)
          }
          const vtt = srtToVtt(srt)
          artifacts.push({
            language: lang,
            filename: `${root}_${lang}.srt`,
            contentType: "application/x-subrip",
            type: "subtitle-srt",
            sizeBytes: srt.length,
            content: srt,
          })
          artifacts.push({
            language: lang,
            filename: `${root}_${lang}.vtt`,
            contentType: "text/vtt",
            type: "subtitle-vtt",
            sizeBytes: vtt.length,
            content: vtt,
          })

          const td = await translateTitleAndDescription(baseTitle, baseDescription ?? "Descriere automată", lang)
          const titlesDesc = `Title: ${td.title}\n\nDescription: ${td.description}`
          artifacts.push({
            language: lang,
            filename: `${root}_${lang}_titles_descriptions.txt`,
            contentType: "text/plain",
            type: "titles-descriptions",
            sizeBytes: titlesDesc.length,
            content: titlesDesc,
          })
        } catch (e) {
          continue
        }
      }
    }

    return NextResponse.json({
      title: baseTitle,
      transcriptSource,
      artifacts,
    })
  } catch (error) {
    console.error("/api/process error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


