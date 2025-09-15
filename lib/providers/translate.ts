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
  try {
    const targetName = resolveLanguageName(targetLanguageCode)
    const system = `You are a subtitle translator. Translate the SRT subtitle file contents into ${targetName}.\nRules:\n- Strictly preserve SRT structure: keep index numbers and timecodes exactly the same.\n- Only translate the subtitle text lines.\n- Do not merge or split lines.\n- Do not add commentary.`
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: srt },
      ],
      temperature: 0.1,
    })
    const txt = res.choices?.[0]?.message?.content?.toString() ?? ""
    console.log(`[translate] SRT translated`, { targetLanguageCode, outBytes: txt.length })
    return txt.trim() || srt
  } catch {
    console.log(`[translate] error translating SRT, passthrough`, { targetLanguageCode })
    return srt
  }
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


