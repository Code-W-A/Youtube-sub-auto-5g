import { NextRequest } from "next/server"
import { segmentsToSrt, srtToVtt, transcribeFromYoutubeUrl } from "@/lib/providers/stt"
import { translateText, translateTitleAndDescription, translateSrtPreserveTiming } from "@/lib/providers/translate"
import { fetchPreferredCaptions, fetchCaptionsSrtFromTrack, getVideoDetails } from "@/lib/providers/youtube"

export type JobStatus = "waiting" | "processing" | "completed" | "error"

export interface ProcessingStepState {
  id: string
  title: string
  description: string
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  estimatedTime?: string
}

export type ArtifactType = "subtitle-srt" | "subtitle-vtt" | "titles-descriptions"

export interface Artifact {
  id: string
  jobId: string
  language: string
  filename: string
  contentType: string
  type: ArtifactType
  sizeBytes: number
}

export interface Job {
  id: string
  title: string
  source: { kind: "youtube" | "upload"; url?: string; filename?: string }
  status: JobStatus
  progress: number
  languages: string[]
  sourceLanguage: string
  generateSubtitles: boolean
  generateTranslations: boolean
  createdAt: number
  completedAt?: number
  steps: ProcessingStepState[]
  errorMessage?: string
  transcriptSource?: "captions" | "stt" | "sample"
  captionsTrack?: { languageCode?: string; name?: string; kind?: string }
  forceStt?: boolean
}

// In-memory stores (dev-only). Persist on global to survive hot-reloads and route isolates.
type GlobalJobStore = {
  jobs: Map<string, Job>
  artifactContent: Map<string, string>
  artifactsByJob: Map<string, Artifact[]>
}

function getStore(): GlobalJobStore {
  const g = globalThis as any
  if (!g.__JOB_STORE__) {
    g.__JOB_STORE__ = {
      jobs: new Map<string, Job>(),
      artifactContent: new Map<string, string>(),
      artifactsByJob: new Map<string, Artifact[]>(),
    } as GlobalJobStore
  }
  return g.__JOB_STORE__ as GlobalJobStore
}

export function getJob(jobId: string): Job | undefined {
  return getStore().jobs.get(jobId)
}

export function listArtifacts(jobId: string): Artifact[] {
  return getStore().artifactsByJob.get(jobId) ?? []
}

export function getArtifactContent(artifactId: string): { artifact: Artifact; content: string } | undefined {
  const store = getStore()
  for (const [jobId, list] of store.artifactsByJob.entries()) {
    const found = list.find((a) => a.id === artifactId)
    if (found) {
      const content = store.artifactContent.get(artifactId) ?? ""
      return { artifact: found, content }
    }
  }
  return undefined
}

export interface CreateJobInput {
  title: string
  source: { kind: "youtube" | "upload"; url?: string; filename?: string }
  sourceLanguage: string
  targetLanguages: string[]
  generateSubtitles: boolean
  generateTranslations: boolean
  forceStt?: boolean
}

export function createJob(input: CreateJobInput): Job {
  const id = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  const steps: ProcessingStepState[] = [
    {
      id: "speech-to-text",
      title: "Speech-to-text RO",
      description: "Extragerea audio și transcrierea în română",
      status: "processing",
      progress: 0,
      estimatedTime: "2-3 min",
    },
    {
      id: "diacritics",
      title: "Corectare diacritice",
      description: "Adăugarea diacriticelor corecte în textul românesc",
      status: "pending",
      progress: 0,
      estimatedTime: "1-2 min",
    },
    {
      id: "subtitles",
      title: "Generare subtitrări",
      description: "Crearea fișierelor de subtitrări sincronizate",
      status: "pending",
      progress: 0,
      estimatedTime: "1 min",
    },
    {
      id: "translations",
      title: "Traduceri",
      description: "Traducerea în limbile selectate",
      status: "pending",
      progress: 0,
      estimatedTime: "3-4 min",
    },
    {
      id: "package",
      title: "Pachet complet",
      description: "Generarea titlurilor, descrierilor și finalizarea",
      status: "pending",
      progress: 0,
      estimatedTime: "1 min",
    },
  ]

  const job: Job = {
    id,
    title: input.title,
    source: input.source,
    status: "processing",
    progress: 0,
    languages: input.targetLanguages,
    sourceLanguage: input.sourceLanguage,
    generateSubtitles: input.generateSubtitles,
    generateTranslations: input.generateTranslations,
    forceStt: input.forceStt ?? false,
    createdAt: Date.now(),
    steps,
  }

  const store = getStore()
  store.jobs.set(id, job)
  store.artifactsByJob.set(id, [])

  // Fire-and-forget: early probe of transcript source so UI can display it during processing
  ;(async () => {
    try {
      if (job.forceStt) {
        updateJob(job.id, { transcriptSource: "stt", captionsTrack: undefined })
      } else if (job.source.kind === "youtube" && job.source.url) {
        const caps = await fetchPreferredCaptions(job.source.url, [job.sourceLanguage === "auto" ? "ro" : job.sourceLanguage, "ro", "en"]) 
        if (caps?.srt) {
          console.log(`[jobs] captions found for job ${job.id}:`, (caps.track as any)?.languageCode, (caps.track as any)?.name?.simpleText)
          updateJob(job.id, {
            transcriptSource: "captions",
            captionsTrack: {
              languageCode: (caps.track as any)?.languageCode,
              name: (caps.track as any)?.name?.simpleText,
              kind: (caps.track as any)?.kind,
            },
          })
        } else {
          console.log(`[jobs] no captions found, will fallback to STT for job ${job.id}`)
          updateJob(job.id, { transcriptSource: "stt", captionsTrack: undefined })
        }
      } else if (job.source.kind === "upload") {
        updateJob(job.id, { transcriptSource: "sample", captionsTrack: undefined })
      }
    } catch (e) {
      console.log(`[jobs] probe transcript failed for job ${job.id}`, e)
    }
  })()

  // Simulate processing pipeline
  simulateProcessing(job)

  return job
}

function updateJob(jobId: string, update: Partial<Job>) {
  const store = getStore()
  const current = store.jobs.get(jobId)
  if (!current) return
  const next: Job = { ...current, ...update }
  store.jobs.set(jobId, next)
}

function setStepStatus(job: Job, stepId: string, status: ProcessingStepState["status"]) {
  const nextSteps = job.steps.map((s) => (s.id === stepId ? { ...s, status } : s))
  updateJob(job.id, { steps: nextSteps })
}

function setStepProgress(job: Job, stepId: string, progress: number) {
  const nextSteps = job.steps.map((s) => (s.id === stepId ? { ...s, progress } : s))
  updateJob(job.id, { steps: nextSteps })
}

function addArtifact(jobId: string, artifact: Artifact, content: string) {
  const store = getStore()
  const list = store.artifactsByJob.get(jobId) ?? []
  list.push(artifact)
  store.artifactsByJob.set(jobId, list)
  store.artifactContent.set(artifact.id, content)
}

function generateSrtSample(text: string): string {
  return `1\n00:00:01,000 --> 00:00:04,000\n${text}\n`
}

function simulateProcessing(job: Job) {
  const interval = setInterval(() => {
    const current = getStore().jobs.get(job.id)
    if (!current) return

    // Advance the currently processing step
    const processing = current.steps.find((s) => s.status === "processing")
    if (processing) {
      const increment = Math.random() * 15 + 5
      const next = Math.min(processing.progress + increment, 100)
      setStepProgress(current, processing.id, next)
      const overall = Math.min((current.progress ?? 0) + increment * 0.2, 98)
      updateJob(current.id, { progress: overall })
      if (next >= 100) {
        // Mark step completed and start next
        setStepStatus(current, processing.id, "completed")
        const steps = (getStore().jobs.get(current.id)?.steps ?? []) as ProcessingStepState[]
        const idx = steps.findIndex((s) => s.id === processing.id)
        if (idx >= 0 && idx < steps.length - 1) {
          const nextSteps: ProcessingStepState[] = steps.map<ProcessingStepState>((s, i) => (i === idx + 1 ? { ...s, status: "processing" } : s))
          updateJob(current.id, { steps: nextSteps as ProcessingStepState[] })
        } else {
          // Finalize job and create artifacts
          finalizeJob(current)
          clearInterval(interval)
        }
      }
    }
  }, 1000)
}

async function finalizeJob(job: Job) {
  let baseTitle = job.title || (job.source.kind === "youtube" ? (job.source.url ?? "YouTube video") : (job.source.filename ?? "Video"))
  let baseDescription: string | undefined
  if (job.source.kind === "youtube" && job.source.url) {
    const details = await getVideoDetails(job.source.url)
    if (details) {
      if (!job.title && details.title) baseTitle = details.title
      baseDescription = details.description
    }
  }

  let roSrt = ""
  let selectedTrack: any = null
  try {
    if (job.forceStt && job.source.kind === "youtube" && job.source.url) {
      const segments = await transcribeFromYoutubeUrl(job.source.url)
      roSrt = segmentsToSrt(segments, (t) => t)
      updateJob(job.id, { transcriptSource: "stt", captionsTrack: undefined })
    } else if (job.source.kind === "youtube" && job.source.url) {
      // 1) Try to fetch existing captions (prefer RO, then EN)
      const caps = await fetchPreferredCaptions(job.source.url, [job.sourceLanguage === "auto" ? "ro" : job.sourceLanguage, "ro", "en"]) 
      if (caps?.srt) {
        roSrt = caps.srt
        selectedTrack = caps.track
        updateJob(job.id, {
          transcriptSource: "captions",
          captionsTrack: {
            languageCode: (caps.track as any)?.languageCode,
            name: (caps.track as any)?.name?.simpleText,
            kind: (caps.track as any)?.kind,
          },
        })
      } else {
        // 2) Fallback: STT
        const segments = await transcribeFromYoutubeUrl(job.source.url)
        roSrt = segmentsToSrt(segments, (t) => t)
        updateJob(job.id, { transcriptSource: "stt", captionsTrack: undefined })
      }
    } else {
      roSrt = generateSrtSample("Bună ziua și bun venit la acest tutorial...")
      updateJob(job.id, { transcriptSource: "sample", captionsTrack: undefined })
    }
  } catch {
    roSrt = generateSrtSample("Bună ziua și bun venit la acest tutorial...")
    updateJob(job.id, { transcriptSource: "sample", captionsTrack: undefined })
  }
  const roVtt = srtToVtt(roSrt)

  if (job.generateSubtitles) {
    addArtifact(job.id, {
      id: crypto.randomUUID(),
      jobId: job.id,
      language: "ro",
      filename: `${slugify(baseTitle)}_ro.srt`,
      contentType: "application/x-subrip",
      type: "subtitle-srt",
      sizeBytes: roSrt.length,
    }, roSrt)
    addArtifact(job.id, {
      id: crypto.randomUUID(),
      jobId: job.id,
      language: "ro",
      filename: `${slugify(baseTitle)}_ro.vtt`,
      contentType: "text/vtt",
      type: "subtitle-vtt",
      sizeBytes: roVtt.length,
    }, roVtt)
  }

  if (job.generateTranslations) {
    const allTargets = job.languages
    for (const lang of allTargets) {
      // Prefer YouTube auto-translate from the selected track if available, else local translate
      let srt: string | null = null
      if (selectedTrack) {
        try {
          srt = await fetchCaptionsSrtFromTrack(selectedTrack, lang)
        } catch {}
      }
      if (!srt) {
        srt = await translateSrtPreserveTiming(roSrt, lang)
      }
      const vtt = srtToVtt(srt)
      addArtifact(job.id, {
        id: crypto.randomUUID(),
        jobId: job.id,
        language: lang,
        filename: `${slugify(baseTitle)}_${lang}.srt`,
        contentType: "application/x-subrip",
        type: "subtitle-srt",
        sizeBytes: srt.length,
      }, srt)
      addArtifact(job.id, {
        id: crypto.randomUUID(),
        jobId: job.id,
        language: lang,
        filename: `${slugify(baseTitle)}_${lang}.vtt`,
        contentType: "text/vtt",
        type: "subtitle-vtt",
        sizeBytes: vtt.length,
      }, vtt)

      const td = await translateTitleAndDescription(baseTitle, baseDescription ?? "Descriere automată", lang)
      const titlesDesc = `Title: ${td.title}\n\nDescription: ${td.description}`
      addArtifact(job.id, {
        id: crypto.randomUUID(),
        jobId: job.id,
        language: lang,
        filename: `${slugify(baseTitle)}_${lang}_titles_descriptions.txt`,
        contentType: "text/plain",
        type: "titles-descriptions",
        sizeBytes: titlesDesc.length,
      }, titlesDesc)
    }
  }

  updateJob(job.id, { status: "completed", progress: 100, completedAt: Date.now() })
  const finalStepsSource = (getStore().jobs.get(job.id)?.steps ?? []) as ProcessingStepState[]
  const finalSteps: ProcessingStepState[] = finalStepsSource.map<ProcessingStepState>((s, i, arr) => i === arr.length - 1 ? { ...s, status: "completed", progress: 100 } : s)
  updateJob(job.id, { steps: finalSteps as ProcessingStepState[] })
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
}


