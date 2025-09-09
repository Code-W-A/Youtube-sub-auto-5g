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

export async function translateText(input: string, targetLanguageCode: string): Promise<string> {
  const client = getOpenAIClient()
  if (!client) {
    return `[${targetLanguageCode.toUpperCase()}] ${input}`
  }
  try {
    const system = `You are a professional translator. Translate the user's text into the target language: ${targetLanguageCode}. Preserve meaning, tone, punctuation, and do not add commentary.`
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: input },
      ],
      temperature: 0.2,
    })
    const txt = res.choices?.[0]?.message?.content?.toString() ?? ""
    return txt.trim() || input
  } catch {
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
    return {
      title: `${baseTitle} [${targetLanguageCode.toUpperCase()}]`,
      description: `[${targetLanguageCode.toUpperCase()}] ${baseDescription}`,
    }
  }
  try {
    const prompt = `Translate the following YouTube video metadata into ${targetLanguageCode}:
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
    return { title, description }
  } catch {
    return {
      title: `${baseTitle} [${targetLanguageCode.toUpperCase()}]`,
      description: `[${targetLanguageCode.toUpperCase()}] ${baseDescription}`,
    }
  }
}


