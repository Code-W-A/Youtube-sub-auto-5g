import { NextResponse } from "next/server"
import { proofreadSrtPreserveTiming, translateSrtPreserveTiming, translateTitleAndDescription } from "@/lib/providers/translate"

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
    const { roSrt, baseTitle, baseDescription, language } = body ?? {}
    if (!roSrt || !language) return NextResponse.json({ error: "Missing roSrt or language" }, { status: 400 })

    let srt: string | null = await translateSrtPreserveTiming(roSrt, language)
    srt = await proofreadSrtPreserveTiming(srt, language)
    const td = await translateTitleAndDescription(baseTitle || "Proiect", baseDescription || "Descriere automată", language)

    return NextResponse.json({
      language,
      srt,
      title: td.title,
      description: td.description,
    })
  } catch (error) {
    console.error("/api/process/language error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}


