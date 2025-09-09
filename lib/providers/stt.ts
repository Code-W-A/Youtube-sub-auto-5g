// STT provider placeholder. Remove when implementing real Whisper/AssemblyAI client.

export interface TranscriptionSegment {
  startMs: number
  endMs: number
  text: string
}

export async function transcribeFromYoutubeUrl(youtubeUrl: string): Promise<TranscriptionSegment[]> {
  // Placeholder: a real implementation would download audio with ytdl-core, then send to Whisper
  // For now we simulate a short transcript
  return [
    { startMs: 1000, endMs: 4000, text: "Bună ziua și bun venit la acest tutorial" },
    { startMs: 4000, endMs: 8000, text: "Astăzi vom învăța cum să optimizăm conținutul video" },
  ]
}

export function segmentsToSrt(segments: TranscriptionSegment[], textTransform?: (t: string) => string): string {
  const toTimestamp = (ms: number) => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    const msPart = ms % 1000
    const pad = (n: number, l: number) => n.toString().padStart(l, "0")
    return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(msPart, 3)}`
  }
  return segments
    .map((seg, idx) => {
      const text = textTransform ? textTransform(seg.text) : seg.text
      return `${idx + 1}\n${toTimestamp(seg.startMs)} --> ${toTimestamp(seg.endMs)}\n${text}\n`
    })
    .join("\n")
}

export function srtToVtt(srt: string): string {
  const converted = srt
    .replace(/,/g, ".")
    .replace(/^(\d+\n)/gm, "")
    .trim()
  return `WEBVTT\n\n${converted}`
}


