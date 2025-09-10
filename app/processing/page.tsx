"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  Type,
  Languages,
  FileText,
  Package,
  CheckCircle,
  Clock,
  Play,
  Pause,
  AlertCircle,
  Youtube,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  estimatedTime?: string
}

interface QueueJob {
  id: string
  title: string
  type: "youtube" | "upload"
  status: "waiting" | "processing" | "completed" | "error"
  progress: number
  languages: string[]
  createdAt: string
}

export default function ProcessingPage() {
  const router = useRouter()
  const params = useSearchParams()
  const jobId = params.get("jobId")

  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(true)
  const [jobTitle, setJobTitle] = useState<string>("Procesare videoclip")
  const [jobUrlInfo, setJobUrlInfo] = useState<string>("")
  const [transcriptInfo, setTranscriptInfo] = useState<string>("")

  const [steps, setSteps] = useState<ProcessingStep[]>([])

  const [queueJobs] = useState<QueueJob[]>([])

  useEffect(() => {
    if (!jobId) return

    let raf: number | null = null
    const poll = async () => {
      try {
        const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`)
        if (!res.ok) throw new Error("status fetch failed")
        const data = await res.json()
        setJobTitle(data.title || "Procesare videoclip")
        if (data.source?.kind === "youtube" && data.source?.url) {
          setJobUrlInfo(`${data.source.url}`)
        } else if (data.source?.filename) {
          setJobUrlInfo(`${data.source.filename}`)
        } else {
          setJobUrlInfo("")
        }
        {
          const src: string | undefined = data.transcriptSource
          let info = ""
          if (src === "captions") {
            const lang = data.captionsTrack?.languageCode ? `${data.captionsTrack.languageCode}` : ""
            const name = data.captionsTrack?.name ? ` – ${data.captionsTrack.name}` : ""
            info = `Sursă transcript: Captions${lang ? ` (${lang}${name})` : ""}`
          } else if (src === "stt") {
            info = "Sursă transcript: STT (fallback)"
          } else if (src === "sample") {
            info = "Sursă transcript: Eșantion (demo)"
          } else {
            info = "Sursă transcript: Necunoscut"
          }
          setTranscriptInfo(info)
        }
        const mappedSteps: ProcessingStep[] = (data.steps || []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.id === "speech-to-text" ? <Mic className="w-5 h-5" /> :
                s.id === "diacritics" ? <Type className="w-5 h-5" /> :
                s.id === "subtitles" ? <FileText className="w-5 h-5" /> :
                s.id === "translations" ? <Languages className="w-5 h-5" /> :
                <Package className="w-5 h-5" />,
          status: s.status,
          progress: s.progress,
          estimatedTime: s.estimatedTime,
        }))
        setSteps(mappedSteps)
        const processingIndex = mappedSteps.findIndex((s) => s.status === "processing")
        setCurrentStep(processingIndex >= 0 ? processingIndex : mappedSteps.length - 1)
        setOverallProgress(Math.round(data.progress || 0))
        const status = data.status as "waiting" | "processing" | "completed" | "error"
        setIsProcessing(status === "processing" || status === "waiting")
        if (status === "completed") {
          router.push(`/results?jobId=${encodeURIComponent(jobId)}`)
          return
        }
      } catch (e) {
        // keep polling
      } finally {
        raf = window.setTimeout(poll, 1200) as unknown as number
      }
    }
    poll()
    return () => {
      if (raf) window.clearTimeout(raf)
    }
  }, [jobId, router])

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const displayedStep = Math.min(completedSteps + 1, Math.max(1, totalSteps))

  const getStepStatusColor = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-500/20"
      case "processing":
        return "text-primary bg-primary/20"
      case "error":
        return "text-red-400 bg-red-500/20"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  const getStepStatusIcon = (status: ProcessingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "processing":
        return <Play className="w-4 h-4" />
      case "error":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Processing Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground text-lg">{jobTitle}</CardTitle>
                      <CardDescription className="text-muted-foreground">{jobUrlInfo}</CardDescription>
                      {transcriptInfo && (
                        <div className="text-xs text-muted-foreground mt-1">{transcriptInfo}</div>
                      )}
                    </div>
                  </div>
                  {/* <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">În procesare</Badge>
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-1" />
                      Pauză
                    </Button>
                  </div> */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progres general</span>
                      <span className="text-foreground font-medium">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      Pasul {displayedStep} din {totalSteps}
                    </span>
                    <span>{isProcessing ? "În desfășurare" : "Finalizat"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Pași procesare</CardTitle>
                <CardDescription className="text-muted-foreground">Progresul fiecărui pas din workflow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex items-center space-x-3 p-3 rounded-lg border",
                        step.status === "processing" ? "border-primary/30 bg-primary/10" : "border-border bg-card",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
                          step.status === "completed" && "bg-green-500/20 text-green-400",
                          step.status === "processing" && "bg-primary/20 text-primary",
                          step.status === "pending" && "bg-muted text-muted-foreground",
                          step.status === "error" && "bg-red-500/20 text-red-400",
                        )}
                      >
                        {step.status === "processing" ? step.icon : getStepStatusIcon(step.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-foreground text-sm">{step.title}</h4>
                          <div className="flex items-center space-x-2">
                            {step.estimatedTime && step.status === "pending" && (
                              <span className="text-xs text-muted-foreground">{step.estimatedTime}</span>
                            )}
                            {step.status === "processing" && (
                              <span className="text-xs text-primary font-medium">{Math.round(step.progress)}%</span>
                            )}
                            {step.status === "completed" && (
                              <span className="text-xs text-green-400 font-medium">Finalizat</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                        {step.status === "processing" && <Progress value={step.progress} className="h-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Removed dummy languages card to keep only real data */}
          </div>

          {/* Right column intentionally left empty to avoid dummy widgets */}
        </div>
      </main>
    </div>
  )
}
