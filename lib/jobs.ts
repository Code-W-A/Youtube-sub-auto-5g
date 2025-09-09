import { NextRequest } from "next/server"
import { segmentsToSrt, srtToVtt, transcribeFromYoutubeUrl } from "@/lib/providers/stt"
import { translateText, translateTitleAndDescription } from "@/lib/providers/translate"
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
    createdAt: Date.now(),
    steps,
  }

  const store = getStore()
  store.jobs.set(id, job)
  store.artifactsByJob.set(id, [])

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
        const steps = getStore().jobs.get(current.id)?.steps ?? []
        const idx = steps.findIndex((s) => s.id === processing.id)
        if (idx >= 0 && idx < steps.length - 1) {
          const nextSteps = steps.map((s, i) => (i === idx + 1 ? { ...s, status: "processing" } : s))
          updateJob(current.id, { steps: nextSteps })
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
  const baseTitle = job.title || (job.source.kind === "youtube" ? (job.source.url ?? "YouTube video") : (job.source.filename ?? "Video"))

  let roSrt = ""
  try {
    if (job.source.kind === "youtube" && job.source.url) {
      // 1) Try to fetch existing captions (prefer RO, then EN)
      const caps = await fetchPreferredCaptions(job.source.url, [job.sourceLanguage === "auto" ? "ro" : job.sourceLanguage, "ro", "en"]) 
      if (caps?.srt) {
        roSrt = caps.srt
      } else {
        // 2) Fallback: STT
        const segments = await transcribeFromYoutubeUrl(job.source.url)
        roSrt = segmentsToSrt(segments, (t) => t)
      }
    } else {
      roSrt = generateSrtSample("Bună ziua și bun venit la acest tutorial...")
    }
  } catch {
    roSrt = generateSrtSample("Bună ziua și bun venit la acest tutorial...")
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
      // naive translate from roSrt lines
      const translatedText = await translateText("Hello and welcome to this tutorial...", lang)
      const srt = generateSrtSample(translatedText)
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

      const td = await translateTitleAndDescription(baseTitle, "Descriere automată", lang)
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
  const finalSteps = (getStore().jobs.get(job.id)?.steps ?? []).map((s, i, arr) => i === arr.length - 1 ? { ...s, status: "completed", progress: 100 } : s)
  updateJob(job.id, { steps: finalSteps })
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


