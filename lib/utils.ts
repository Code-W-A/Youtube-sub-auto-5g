import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert YouTube SBV subtitle format to SRT
export function sbvToSrt(sbvInput: string): string {
  const sbv = (sbvInput || "").replace(/\r\n/g, "\n")
  const lines = sbv.split("\n")
  const out: string[] = []
  let i = 0
  let index = 1

  const isTimeLine = (line: string) =>
    /^\s*\d{1,2}:\d{2}:\d{2}\.\d{3}\s*,\s*\d{1,2}:\d{2}:\d{2}\.\d{3}\s*$/.test(line)

  const toSrtTimeFromSbv = (t: string) => {
    // t like H:MM:SS.mmm or HH:MM:SS.mmm
    const m = t.trim().match(/^(\d{1,2}):(\d{2}):(\d{2})\.(\d{3})$/)
    if (!m) return "00:00:00,000"
    const hh = m[1].padStart(2, "0")
    const mm = m[2]
    const ss = m[3]
    const ms = m[4]
    return `${hh}:${mm}:${ss},${ms}`
  }

  while (i < lines.length) {
    // skip blank lines
    while (i < lines.length && lines[i].trim() === "") i++
    if (i >= lines.length) break

    if (!isTimeLine(lines[i])) {
      // Not a valid SBV block start; skip this line
      i++
      continue
    }

    const [startRaw, endRaw] = lines[i].split(",")
    const start = toSrtTimeFromSbv(startRaw || "0:00:00.000")
    const end = toSrtTimeFromSbv(endRaw || "0:00:00.000")
    i++

    const textLines: string[] = []
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i])
      i++
    }

    out.push(`${index}\n${start} --> ${end}\n${textLines.join("\n")}\n`)
    index++
  }

  return out.join("\n")
}
