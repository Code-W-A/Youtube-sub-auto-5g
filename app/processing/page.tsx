"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [currentStep, setCurrentStep] = useState(0)
  const [overallProgress, setOverallProgress] = useState(15)
  const [isProcessing, setIsProcessing] = useState(true)

  const [steps, setSteps] = useState<ProcessingStep[]>([
    {
      id: "speech-to-text",
      title: "Speech-to-text RO",
      description: "Extragerea audio și transcrierea în română",
      icon: <Mic className="w-5 h-5" />,
      status: "completed",
      progress: 100,
      estimatedTime: "2-3 min",
    },
    {
      id: "diacritics",
      title: "Corectare diacritice",
      description: "Adăugarea diacriticelor corecte în textul românesc",
      icon: <Type className="w-5 h-5" />,
      status: "processing",
      progress: 65,
      estimatedTime: "1-2 min",
    },
    {
      id: "subtitles",
      title: "Generare subtitrări",
      description: "Crearea fișierelor de subtitrări sincronizate",
      icon: <FileText className="w-5 h-5" />,
      status: "pending",
      progress: 0,
      estimatedTime: "1 min",
    },
    {
      id: "translations",
      title: "Traduceri",
      description: "Traducerea în limbile selectate (EN, FR, ES, DE)",
      icon: <Languages className="w-5 h-5" />,
      status: "pending",
      progress: 0,
      estimatedTime: "3-4 min",
    },
    {
      id: "package",
      title: "Pachet complet",
      description: "Generarea titlurilor, descrierilor și finalizarea",
      icon: <Package className="w-5 h-5" />,
      status: "pending",
      progress: 0,
      estimatedTime: "1 min",
    },
  ])

  const [queueJobs] = useState<QueueJob[]>([
    {
      id: "current",
      title: "Tutorial Marketing Digital",
      type: "youtube",
      status: "processing",
      progress: 65,
      languages: ["EN", "FR", "ES", "DE"],
      createdAt: "Acum 5 minute",
    },
    {
      id: "queue-1",
      title: "Prezentare Produs 2024.mp4",
      type: "upload",
      status: "waiting",
      progress: 0,
      languages: ["EN", "DE"],
      createdAt: "Acum 2 minute",
    },
    {
      id: "queue-2",
      title: "Webinar Tehnologie",
      type: "youtube",
      status: "waiting",
      progress: 0,
      languages: ["EN"],
      createdAt: "Acum 1 minut",
    },
  ])

  // Simulate processing progress
  useEffect(() => {
    if (!isProcessing) return

    const interval = setInterval(() => {
      setSteps((prevSteps) => {
        const newSteps = [...prevSteps]
        const processingStep = newSteps.find((step) => step.status === "processing")

        if (processingStep) {
          processingStep.progress = Math.min(processingStep.progress + Math.random() * 10, 100)

          if (processingStep.progress >= 100) {
            processingStep.status = "completed"
            const currentIndex = newSteps.findIndex((step) => step.id === processingStep.id)

            if (currentIndex < newSteps.length - 1) {
              newSteps[currentIndex + 1].status = "processing"
              setCurrentStep(currentIndex + 1)
            } else {
              setIsProcessing(false)
            }
          }
        }

        return newSteps
      })

      setOverallProgress((prev) => Math.min(prev + Math.random() * 2, 95))
    }, 1000)

    return () => clearInterval(interval)
  }, [isProcessing])

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length

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
                      <CardTitle className="text-foreground text-lg">Tutorial Marketing Digital</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        youtube.com/watch?v=abc123 • 12:34 min
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">În procesare</Badge>
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-1" />
                      Pauză
                    </Button>
                  </div>
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
                      Pasul {completedSteps + 1} din {totalSteps}
                    </span>
                    <span>Timp estimat rămas: ~{isProcessing ? "4-6 min" : "Finalizat"}</span>
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

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Limbi în procesare</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Status traducerilor pentru acest proiect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { code: "RO", name: "Română", flag: "🇷🇴", status: "completed" },
                    { code: "EN", name: "English", flag: "🇺🇸", status: "processing" },
                    { code: "FR", name: "Français", flag: "🇫🇷", status: "pending" },
                    { code: "ES", name: "Español", flag: "🇪🇸", status: "pending" },
                    { code: "DE", name: "Deutsch", flag: "🇩🇪", status: "pending" },
                  ].map((lang) => (
                    <div
                      key={lang.code}
                      className={cn(
                        "flex items-center space-x-2 p-2 rounded border text-sm",
                        lang.status === "completed" && "border-green-500/30 bg-green-500/10",
                        lang.status === "processing" && "border-primary/30 bg-primary/10",
                        lang.status === "pending" && "border-border bg-card",
                      )}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{lang.code}</p>
                        <p className="text-xs text-muted-foreground">{lang.name}</p>
                      </div>
                      {lang.status === "completed" && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {lang.status === "processing" && (
                        <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Coadă procesare</CardTitle>
                <CardDescription className="text-muted-foreground">Job-uri în așteptare</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {queueJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={cn(
                      "p-3 rounded border",
                      job.status === "processing" ? "border-primary/30 bg-primary/10" : "border-border bg-card",
                    )}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className={cn(
                          "w-6 h-6 rounded flex items-center justify-center",
                          job.type === "youtube" ? "bg-red-500/20" : "bg-muted",
                        )}
                      >
                        {job.type === "youtube" ? (
                          <Youtube className="w-3 h-3 text-red-400" />
                        ) : (
                          <Play className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{job.title}</h4>
                        <p className="text-xs text-muted-foreground">{job.createdAt}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          className={cn(
                            "text-xs",
                            job.status === "processing" && "bg-primary/20 text-primary",
                            job.status === "waiting" && "bg-muted text-muted-foreground",
                          )}
                        >
                          {job.status === "processing" ? "În procesare" : "În așteptare"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {job.status === "processing" ? `${job.progress}%` : `Poziția ${index}`}
                        </span>
                      </div>

                      {job.status === "processing" && <Progress value={job.progress} className="h-1" />}

                      <div className="flex flex-wrap gap-1">
                        {job.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs border-border text-muted-foreground">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Status sistem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Servere procesare</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-foreground">Operațional</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API traduceri</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-foreground">Operațional</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Timp răspuns mediu</span>
                  <span className="text-foreground">1.2s</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
