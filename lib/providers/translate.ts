import OpenAI from "openai"

const openaiApiKey = process.env.OPENAI_API_KEY

function getOpenAIClient(): OpenAI | null {
  if (!openaiApiKey) return null
  try {
    return new OpenAI({ apiKey: openaiApiKey })
  } catch {
    return null
  }
}

function resolveLanguageName(code: string): string {
  const c = (code || "").toLowerCase()
  const map: Record<string, string> = {
    sq: "Albanian",
    ar: "Arabic",
    bs: "Bosnian",
    bg: "Bulgarian",
    cs: "Czech",
    zh: "Chinese",
    ko: "Korean",
    co: "Corsican",
    hr: "Croatian",
    da: "Danish",
    he: "Hebrew",
    en: "English",
    et: "Estonian",
    fi: "Finnish",
    fr: "French",
    ka: "Georgian",
    de: "German",
    el: "Greek",
    id: "Indonesian",
    it: "Italian",
    ja: "Japanese",
    lv: "Latvian",
    lt: "Lithuanian",
    mk: "Macedonian",
    hu: "Hungarian",
    mn: "Mongolian",
    nl: "Dutch",
    no: "Norwegian",
    fa: "Persian",
    pl: "Polish",
    pt: "Portuguese",
    ro: "Romanian",
    ru: "Russian",
    sr: "Serbian",
    sk: "Slovak",
    sl: "Slovenian",
    es: "Spanish",
    sv: "Swedish",
    th: "Thai",
    tr: "Turkish",
    vi: "Vietnamese",
  }
  return map[c] || code
}

function formatOpenAIError(err: unknown): string {
  try {
    const anyErr = err as any
    if (!anyErr) return "unknown"
    if (anyErr.status || anyErr.code) {
      return JSON.stringify({ status: anyErr.status, code: anyErr.code, message: anyErr.message, data: anyErr.response?.data })
    }
    return anyErr.message || String(anyErr)
  } catch {
    return "unknown"
  }
}

export async function translateText(input: string, targetLanguageCode: string): Promise<string> {
  const client = getOpenAIClient()
  if (!client) {
    console.log(`[translate] no OPENAI key, echoing text`, { targetLanguageCode, inputLen: input.length })
    return `[${targetLanguageCode.toUpperCase()}] ${input}`
  }
  try {
    const targetName = resolveLanguageName(targetLanguageCode)
    const system = `You are a professional translator. Translate the user's text into ${targetName}. Preserve meaning, tone, punctuation, and do not add commentary.`
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
      temperature: 0.2,
    })
    const txt = res.choices?.[0]?.message?.content?.toString() ?? ""
    console.log(`[translate] text translated`, { targetLanguageCode, outLen: txt.length })
    return txt.trim() || input
  } catch {
    console.log(`[translate] error translating text, echo fallback`, { targetLanguageCode })
    return `[${targetLanguageCode.toUpperCase()}] ${input}`
  }
}

export async function translateTitleAndDescription(
  baseTitle: string,
  baseDescription: string,
  targetLanguageCode: string,
): Promise<{ title: string; description: string }> {
  const client = getOpenAIClient()
  if (!client) {
    console.log(`[translate] no OPENAI key for titles/desc, echoing`, { targetLanguageCode })
    return {
      title: `${baseTitle} [${targetLanguageCode.toUpperCase()}]`,
      description: `[${targetLanguageCode.toUpperCase()}] ${baseDescription}`,
    }
  }
  try {
    const targetName = resolveLanguageName(targetLanguageCode)
    const prompt = `Translate the following YouTube video metadata into ${targetName}:
Title:
${baseTitle}

Description:
${baseDescription}

Return the result strictly in this format:
Title: <translated title>
Description: <translated description>`
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You translate YouTube titles and descriptions clearly and naturally." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    })
    const txt = res.choices?.[0]?.message?.content?.toString() ?? ""
    const titleMatch = txt.match(/Title:\s*([^\n]+)/i)
    const descMatch = txt.match(/Description:\s*([\s\S]+)/i)
    const title = (titleMatch?.[1] ?? baseTitle).trim()
    const description = (descMatch?.[1] ?? baseDescription).trim()
    console.log(`[translate] titles/descriptions translated`, { targetLanguageCode, titleLen: title.length, descLen: description.length })
    return { title, description }
  } catch {
    console.log(`[translate] error titles/desc, echo fallback`, { targetLanguageCode })
    return {
      title: `${baseTitle} [${targetLanguageCode.toUpperCase()}]`,
      description: `[${targetLanguageCode.toUpperCase()}] ${baseDescription}`,
    }
  }
}


export async function translateSrtPreserveTiming(srt: string, targetLanguageCode: string): Promise<string> {
  const client = getOpenAIClient()
  if (!client) {
    // Fallback: keep original text but tag language (still preserves link content)
    console.log(`[translate] no OPENAI key for SRT, tagging only`, { targetLanguageCode, srtBytes: srt.length })
    const lines = srt.split("\n")
    const out: string[] = []
    for (const line of lines) {
      // Keep index and timing lines as-is; only touch text lines
      if (/^\d+$/.test(line) || /-->/.test(line) || line.trim() === "") {
        out.push(line)
      } else {
        out.push(`[${targetLanguageCode.toUpperCase()}] ${line}`)
      }
    }
    return out.join("\n")
  }
  // Robust approach: split SRT into chunks by blocks, translate chunks with retry, validate structure
  const blocks = srt.split(/\n\n+/g)
  const chunkSize = 40 // blocks per chunk
  const chunks: string[][] = []
  for (let i = 0; i < blocks.length; i += chunkSize) {
    chunks.push(blocks.slice(i, i + chunkSize))
  }

  const targetName = resolveLanguageName(targetLanguageCode)
  const system = `You are a subtitle translator. Translate the SRT subtitle file contents into ${targetName}.
Rules:
- Strictly preserve SRT structure: keep index numbers and timecodes exactly the same.
- Only translate the subtitle text lines.
- Do not merge or split lines.
- Do not add commentary.`

  const translateChunk = async (chunkText: string, attempt: number, idx: number): Promise<string | null> => {
    try {
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: chunkText },
        ],
        temperature: 0.1,
      })
      const out = res.choices?.[0]?.message?.content?.toString()?.trim() ?? ""
      console.log(`[translate] chunk result`, { lang: targetLanguageCode, idx, attempt, inBytes: chunkText.length, outBytes: out.length })
      if (!out) return null
      // Quick structural validation: same number of blocks, same number of timecode lines
      const inBlocks = chunkText.split(/\n\n+/g)
      const outBlocks = out.split(/\n\n+/g)
      if (outBlocks.length !== inBlocks.length) {
        console.log(`[translate] chunk blockCount mismatch; retry`, { lang: targetLanguageCode, idx, attempt, inBlocks: inBlocks.length, outBlocks: outBlocks.length })
        if (attempt < 2) return await translateChunk(chunkText, attempt + 1, idx)
        return null
      }
      // Validate each block retains index and timecode lines
      const timecode = /\d\d:\d\d:\d\d[,.]\d{3}\s+-->\s+\d\d:\d\d:\d\d[,.]\d{3}/
      for (let i = 0; i < inBlocks.length; i++) {
        const ib = inBlocks[i].split("\n")
        const ob = outBlocks[i].split("\n")
        if (ib.length < 2 || ob.length < 2) {
          console.log(`[translate] chunk lineCount invalid; retry`, { lang: targetLanguageCode, idx, attempt })
          return attempt < 2 ? await translateChunk(chunkText, attempt + 1, idx) : null
        }
        if (!/^\d+$/.test(ib[0]) || !/^\d+$/.test(ob[0])) {
          console.log(`[translate] chunk index invalid; retry`, { lang: targetLanguageCode, idx, attempt })
          return attempt < 2 ? await translateChunk(chunkText, attempt + 1, idx) : null
        }
        if (!timecode.test(ib[1]) || !timecode.test(ob[1])) {
          console.log(`[translate] chunk timecode invalid; retry`, { lang: targetLanguageCode, idx, attempt })
          return attempt < 2 ? await translateChunk(chunkText, attempt + 1, idx) : null
        }
      }
      return out
    } catch (err) {
      console.log(`[translate] chunk error; retry`, { lang: targetLanguageCode, idx, attempt, error: formatOpenAIError(err) })
      if (attempt < 2) return await translateChunk(chunkText, attempt + 1, idx)
      return null
    }
  }

  const results: string[] = []
  for (let ci = 0; ci < chunks.length; ci++) {
    const group = chunks[ci]
    const originalChunk = group.join("\n\n")
    console.log(`[translate] chunk start`, { lang: targetLanguageCode, idx: ci, inBytes: originalChunk.length, blocks: group.length })
    const translated = await translateChunk(originalChunk, 0, ci)
    if (translated) {
      console.log(`[translate] chunk ok`, { lang: targetLanguageCode, idx: ci, outBytes: translated.length })
      results.push(translated)
      continue
    }
    // Fallback: per-block translation
    console.log(`[translate] fallback per-block`, { lang: targetLanguageCode, idx: ci, blocks: group.length })
    const perBlockOut: string[] = []
    for (const block of group) {
      const lines = block.split("\n")
      if (lines.length < 3) { perBlockOut.push(block); continue }
      const index = lines[0]
      const tc = lines[1]
      const textLines = lines.slice(2).join("\n")
      try {
        const res = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: textLines },
          ],
          temperature: 0.1,
        })
        const txt = res.choices?.[0]?.message?.content?.toString()?.trim() ?? ""
        const safeText = txt || textLines
        perBlockOut.push([index, tc, safeText].join("\n"))
      } catch (err) {
        console.log(`[translate] block error; passthrough`, { lang: targetLanguageCode, error: formatOpenAIError(err) })
        perBlockOut.push([index, tc, textLines].join("\n"))
      }
    }
    results.push(perBlockOut.join("\n\n"))
  }

  const finalOut = results.join("\n\n")
  console.log(`[translate] SRT translated`, { targetLanguageCode, outBytes: finalOut.length })
  return finalOut || srt
}


export async function proofreadSrtPreserveTiming(srt: string, languageCode: string): Promise<string> {
  const client = getOpenAIClient()
  if (!client) {
    // No API: return input unchanged
    return srt
  }
  try {
    const languageName = resolveLanguageName(languageCode)
    const system = `You are a professional proofreader for ${languageName}. Improve grammar, spelling, and diacritics while strictly preserving SRT structure.
Rules:
- Keep index numbers and timecodes exactly the same.
- Only modify subtitle text lines.
- Do not merge or split lines.
- Do not add commentary.`
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: srt },
      ],
      temperature: 0.1,
    })
    const txt = res.choices?.[0]?.message?.content?.toString() ?? ""
    return txt.trim() || srt
  } catch {
    return srt
  }
}


