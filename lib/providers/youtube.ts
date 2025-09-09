import ytdl from "ytdl-core"

interface CaptionTrack {
  baseUrl: string
  vssId?: string
  languageCode?: string
  kind?: string // ASR, etc.
  name?: { simpleText?: string }
}

export async function getVideoDetails(youtubeUrl: string): Promise<{ title: string; description?: string } | null> {
  try {
    const info = await ytdl.getInfo(youtubeUrl)
    const title = info.videoDetails?.title || "Video"
    const description = (info.videoDetails as any)?.shortDescription
    return { title, description }
  } catch {
    return null
  }
}

export async function getCaptionTracks(youtubeUrl: string): Promise<CaptionTrack[] | null> {
  try {
    const info = await ytdl.getInfo(youtubeUrl)
    const pr: any = info.player_response || (info as any).player_response
    const captions = pr?.captions?.playerCaptionsTracklistRenderer?.captionTracks
    if (!captions || !Array.isArray(captions)) return null
    return captions as CaptionTrack[]
  } catch {
    return null
  }
}

export function pickCaptionTrack(tracks: CaptionTrack[], preferLangs: string[] = ["ro", "en"]): CaptionTrack | null {
  for (const lang of preferLangs) {
    const exact = tracks.find((t) => (t.languageCode || "").toLowerCase() === lang.toLowerCase())
    if (exact) return exact
  }
  return tracks[0] || null
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

export async function fetchCaptionsSrtFromTrack(track: CaptionTrack, tlang?: string): Promise<string | null> {
  let u = track.baseUrl
  u += (u.includes("?") ? "&" : "?") + "fmt=srt"
  if (tlang) {
    u += `&tlang=${encodeURIComponent(tlang)}`
  }
  return await fetchText(u)
}

export async function fetchPreferredCaptions(
  youtubeUrl: string,
  preferLangs: string[] = ["ro", "en"],
): Promise<{ track: CaptionTrack; srt: string } | null> {
  const tracks = await getCaptionTracks(youtubeUrl)
  if (!tracks || tracks.length === 0) return null
  const track = pickCaptionTrack(tracks, preferLangs)
  if (!track) return null
  const srt = await fetchCaptionsSrtFromTrack(track)
  if (!srt) return null
  return { track, srt }
}


