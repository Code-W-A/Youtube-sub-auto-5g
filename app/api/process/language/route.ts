import { NextResponse } from "next/server"
import { translateSrtPreserveTiming, translateTitleAndDescription } from "@/lib/providers/translate"

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
    const { roSrt, baseTitle, baseDescription, language, translateMeta = false } = body ?? {}
    if (!roSrt || !language) return NextResponse.json({ error: "Missing roSrt or language" }, { status: 400 })

    const srt: string | null = await translateSrtPreserveTiming(roSrt, language)
    let title = ""
    let description = ""
    if (translateMeta) {
      const td = await translateTitleAndDescription(baseTitle || "Proiect", baseDescription || "Descriere automată", language)
      title = td.title
      description = td.description
    }

    return NextResponse.json({
      language,
      srt,
      title,
      description,
    })
  } catch (error) {
    console.error("/api/process/language error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


