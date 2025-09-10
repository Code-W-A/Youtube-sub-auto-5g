"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, Copy, CheckCircle, FileText, Youtube, Package, Eye, Edit3, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"

interface SubtitleFile {
  language: string
  languageName: string
  flag: string
  format: "srt" | "vtt"
  size: string
  preview: string
}

interface TitleDescription {
  language: string
  languageName: string
  flag: string
  title: string
  description: string
  titleMaxLength: number
  descriptionMaxLength: number
}

export default function ResultsPage() {
  const { toast } = useToast()
  const params = useSearchParams()
  const jobId = params.get("jobId")
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState<string | null>(null)

  const [projectTitle, setProjectTitle] = useState<string>("Rezultate procesare")
  const [transcriptInfo, setTranscriptInfo] = useState<string>("")
  const [subtitleFiles, setSubtitleFiles] = useState<SubtitleFile[]>([])
  const [titlesDescriptions, setTitlesDescriptions] = useState<TitleDescription[]>([])
  const [hasJob, setHasJob] = useState<boolean>(false)
  const [artifactList, setArtifactList] = useState<any[]>([])
  const [processingTime, setProcessingTime] = useState<string>("—")

  const languageMeta: Record<string, { name: string; flag: string }> = useMemo(
    () => ({
      ro: { name: "Română", flag: "🇷🇴" },
      en: { name: "English", flag: "🇺🇸" },
      fr: { name: "Français", flag: "🇫🇷" },
      es: { name: "Español", flag: "🇪🇸" },
      de: { name: "Deutsch", flag: "🇩🇪" },
      it: { name: "Italiano", flag: "🇮🇹" },
      pt: { name: "Português", flag: "🇵🇹" },
      ru: { name: "Русский", flag: "🇷🇺" },
      ja: { name: "日本語", flag: "🇯🇵" },
      ko: { name: "한국어", flag: "🇰🇷" },
      zh: { name: "中文", flag: "🇨🇳" },
    }),
    [],
  )

  useEffect(() => {
    if (!jobId) return
    const load = async () => {
      const jobRes = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`)
      if (jobRes.ok) {
        const job = await jobRes.json()
        setProjectTitle(job.title || "Rezultate procesare")
        if (job.createdAt && job.completedAt) {
          const ms = Math.max(0, Number(job.completedAt) - Number(job.createdAt))
          const sec = Math.floor(ms / 1000)
          const m = Math.floor(sec / 60)
          const s = sec % 60
          setProcessingTime(m > 0 ? `${m} min ${s}s` : `${s}s`)
        } else {
          setProcessingTime("—")
        }
        const src: string | undefined = job.transcriptSource
        let info = ""
        if (src === "captions") {
          const lang = job.captionsTrack?.languageCode ? `${job.captionsTrack.languageCode}` : ""
          const name = job.captionsTrack?.name ? ` – ${job.captionsTrack.name}` : ""
          info = `Sursă transcript: Captions${lang ? ` (${lang}${name})` : ""}`
        } else if (src === "stt") {
          info = "Sursă transcript: STT (fallback)"
        } else if (src === "sample") {
          info = "Sursă transcript: Eșantion (demo)"
        } else if (src === "uploaded") {
          info = "Sursă transcript: SRT încărcat"
        } else {
          info = "Sursă transcript: Necunoscut"
        }
        setTranscriptInfo(info)
        setHasJob(true)
      }
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}/artifacts`)
      if (!res.ok) return
      const list = await res.json()
      setArtifactList(list as any[])
      const subs: SubtitleFile[] = []
      const titles: TitleDescription[] = []
      for (const a of list as any[]) {
        const meta = languageMeta[a.language] || { name: a.language.toUpperCase(), flag: "🌐" }
        if (a.type === "subtitle-srt" || a.type === "subtitle-vtt") {
          subs.push({
            language: a.language,
            languageName: meta.name,
            flag: meta.flag,
            format: a.type === "subtitle-srt" ? "srt" : "vtt",
            size: `${Math.round((a.sizeBytes || 0) / 1024)} KB`,
            preview: "",
          })
        }
        if (a.type === "titles-descriptions") {
          const content = await fetch(`/api/artifacts/${a.id}/download`).then((r) => r.text())
          const [firstLine, ...rest] = content.split("\n")
          const title = firstLine.replace(/^Title:\s*/i, "").trim() || projectTitle
          const description = rest.join("\n").replace(/^Description:\s*/i, "").trim()
          titles.push({
            language: a.language,
            languageName: meta.name,
            flag: meta.flag,
            title,
            description,
            titleMaxLength: 100,
            descriptionMaxLength: 5000,
          })
        }
      }
      setSubtitleFiles(subs)
      setTitlesDescriptions(titles)
    }
    load()
  }, [jobId, languageMeta, projectTitle])

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copiat cu succes!",
        description: `${type} a fost copiat în clipboard.`,
      })
    } catch (err) {
      toast({
        title: "Eroare la copiere",
        description: "Nu s-a putut copia textul în clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleTitleEdit = (language: string, newTitle: string) => {
    setTitlesDescriptions((prev) =>
      prev.map((item) => (item.language === language ? { ...item, title: newTitle } : item)),
    )
  }

  const handleDescriptionEdit = (language: string, newDescription: string) => {
    setTitlesDescriptions((prev) =>
      prev.map((item) => (item.language === language ? { ...item, description: newDescription } : item)),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-center">
                <Youtube className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{projectTitle}</h2>
                <p className="text-muted-foreground">Finalizat cu succes</p>
                {transcriptInfo && (
                  <div className="text-xs text-muted-foreground mt-1">{transcriptInfo}</div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle className="w-4 h-4 mr-1" />
                Procesare completă
              </Badge>
              <Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
                if (!jobId) {
                  toast({ title: "Lipsește jobId", description: "Deschide rezultatele din pagina de procesare.", variant: "destructive" })
                  return
                }
                window.location.href = `/api/jobs/${jobId}/package`
              }}>
                <Package className="w-4 h-4 mr-2" />
                Descarcă toate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Subtitrări</p>
                    <p className="text-lg font-medium text-foreground">{subtitleFiles.length} fișiere</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Youtube className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Titluri & Descrieri</p>
                    <p className="text-lg font-medium text-foreground">{titlesDescriptions.length} limbi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensiune totală</p>
                    <p className="text-lg font-medium text-foreground">{
                      (() => {
                        const total = artifactList.reduce((acc, a: any) => acc + (a.sizeBytes || 0), 0)
                        return `${Math.max(1, Math.round(total / 1024))} KB`
                      })()
                    }</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timp procesare</p>
                    <p className="text-lg font-medium text-foreground">{processingTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="subtitles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="subtitles" className="data-[state=active]:bg-muted">
              Subtitrări
            </TabsTrigger>
            <TabsTrigger value="titles-descriptions" className="data-[state=active]:bg-muted">
              Titluri & Descrieri
            </TabsTrigger>
            <TabsTrigger value="complete-package" className="data-[state=active]:bg-muted">
              Pachet complet
            </TabsTrigger>
          </TabsList>

          {/* Subtitles Tab */}
          <TabsContent value="subtitles" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Fișiere subtitrări</CardTitle>
                <CardDescription>Subtitrările generate în toate limbile selectate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subtitleFiles.map((file, idx) => (
                    <div
                      key={`${file.language}-${idx}`}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{file.flag}</div>
                        <div>
                          <h4 className="font-medium text-foreground">{file.languageName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {file.format.toUpperCase()} • {file.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="border-border bg-transparent" disabled={!hasJob} onClick={async () => {
                          if (!hasJob || !jobId) {
                            toast({ title: "Lipsește jobId", description: "Deschide rezultatele din pagina de procesare.", variant: "destructive" })
                            return
                          }
                          try {
                            const srt = artifactList.find((a: any) => a.language === file.language && a.type === "subtitle-srt")
                            if (srt) {
                              const txt = await fetch(`/api/artifacts/${srt.id}/download`).then(r => r.text())
                              toast({ title: "Preview", description: txt.slice(0, 200) + (txt.length > 200 ? "..." : "") })
                            } else {
                              toast({ title: "Subtitrare lipsă", description: "Nu am găsit fișierul .srt pentru această limbă.", variant: "destructive" })
                            }
                          } catch (e) {
                            toast({ title: "Eroare la preview", description: "Încercare eșuată.", variant: "destructive" })
                          }
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="border-border bg-transparent" disabled={!hasJob} onClick={async () => {
                          if (!hasJob || !jobId) {
                            toast({ title: "Lipsește jobId", description: "Deschide rezultatele din pagina de procesare.", variant: "destructive" })
                            return
                          }
                          const srt = artifactList.find((a: any) => a.language === file.language && a.type === "subtitle-srt")
                          if (srt) window.location.href = `/api/artifacts/${srt.id}/download`
                          else toast({ title: "Subtitrare lipsă", description: "Nu am găsit fișierul .srt pentru această limbă.", variant: "destructive" })
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          .srt
                        </Button>
                        <Button variant="outline" size="sm" className="border-border bg-transparent" disabled={!hasJob} onClick={async () => {
                          if (!hasJob || !jobId) {
                            toast({ title: "Lipsește jobId", description: "Deschide rezultatele din pagina de procesare.", variant: "destructive" })
                            return
                          }
                          const vtt = artifactList.find((a: any) => a.language === file.language && a.type === "subtitle-vtt")
                          if (vtt) window.location.href = `/api/artifacts/${vtt.id}/download`
                          else toast({ title: "Subtitrare lipsă", description: "Nu am găsit fișierul .vtt pentru această limbă.", variant: "destructive" })
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          .vtt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button className="bg-primary hover:bg-primary/90 text-white" disabled={!hasJob} onClick={async () => {
                    if (!hasJob || !jobId) {
                      toast({ title: "Lipsește jobId", description: "Deschide rezultatele din pagina de procesare.", variant: "destructive" })
                      return
                    }
                    for (const a of artifactList) {
                      if (a.type === "subtitle-srt" || a.type === "subtitle-vtt") {
                        window.open(`/api/artifacts/${a.id}/download`, "_blank")
                      }
                    }
                  }}>
                    <Download className="w-4 h-4 mr-2" />
                    Descarcă toate subtitrările
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Titles & Descriptions Tab */}
          <TabsContent value="titles-descriptions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {titlesDescriptions.map((item) => (
                <Card key={item.language} className="border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{item.flag}</span>
                        <CardTitle className="text-foreground">{item.languageName}</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(`${item.title}\n\n${item.description}`, "Titlu și descriere")}
                        className="border-border"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiază tot
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Title */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Titlu</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {item.title.length}/{item.titleMaxLength}
                          </span>
                          {editingTitle === item.language ? (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTitle(null)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingTitle(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingTitle(item.language)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingTitle === item.language ? (
                        <Textarea
                          value={item.title}
                          onChange={(e) => handleTitleEdit(item.language, e.target.value)}
                          className="min-h-[60px] resize-none border-border"
                          maxLength={item.titleMaxLength}
                        />
                      ) : (
                        <div
                          className="p-3 bg-muted border border-border rounded-lg text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => handleCopy(item.title, "Titlu")}
                        >
                          {item.title}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-foreground">Descriere</Label>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {item.description.length}/{item.descriptionMaxLength}
                          </span>
                          {editingDescription === item.language ? (
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDescription(null)}
                                className="h-6 w-6 p-0"
                              >
                                <Save className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingDescription(null)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDescription(item.language)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {editingDescription === item.language ? (
                        <Textarea
                          value={item.description}
                          onChange={(e) => handleDescriptionEdit(item.language, e.target.value)}
                          className="min-h-[200px] resize-none border-border"
                          maxLength={item.descriptionMaxLength}
                        />
                      ) : (
                        <div
                          className="p-3 bg-muted border border-border rounded-lg text-sm text-foreground cursor-pointer hover:bg-muted/80 transition-colors max-h-[200px] overflow-y-auto"
                          onClick={() => handleCopy(item.description, "Descriere")}
                        >
                          <pre className="whitespace-pre-wrap font-sans">{item.description}</pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Complete Package Tab */}
          <TabsContent value="complete-package" className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Pachet complet</CardTitle>
                <CardDescription>
                  Descarcă toate fișierele organizate în foldere structurate pentru fiecare limbă
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted border border-border rounded-lg p-6">
                    <h4 className="font-medium text-foreground mb-4">Structura pachetului:</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div className="text-muted-foreground">📁 Tutorial_Marketing_Digital/</div>
                      <div className="ml-4 text-muted-foreground">📁 Subtitrari/</div>
                      <div className="ml-8 text-foreground">📄 RO_subtitrari.srt</div>
                      <div className="ml-8 text-foreground">📄 EN_subtitles.srt</div>
                      <div className="ml-8 text-foreground">📄 FR_sous-titres.srt</div>
                      <div className="ml-8 text-foreground">📄 ES_subtitulos.srt</div>
                      <div className="ml-8 text-foreground">📄 DE_untertitel.srt</div>
                      <div className="ml-4 text-muted-foreground">📁 Titluri_Descrieri/</div>
                      <div className="ml-8 text-foreground">📄 RO_titlu_descriere.txt</div>
                      <div className="ml-8 text-foreground">📄 EN_title_description.txt</div>
                      <div className="ml-8 text-foreground">📄 FR_titre_description.txt</div>
                      <div className="ml-8 text-foreground">📄 ES_titulo_descripcion.txt</div>
                      <div className="ml-8 text-foreground">📄 DE_titel_beschreibung.txt</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-border">
                      <CardContent className="p-6 text-center">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="font-medium text-foreground mb-2">Pachet complet (.zip)</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Toate fișierele organizate în foldere structurate
                        </p>
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white" onClick={() => {
                          if (!jobId) return
                          window.location.href = `/api/jobs/${jobId}/package`
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Descarcă pachetul (63.5 KB)
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-border">
                      <CardContent className="p-6 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h4 className="font-medium text-foreground mb-2">Doar subtitrări (.zip)</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Numai fișierele de subtitrări în toate limbile
                        </p>
                        <Button variant="outline" className="w-full border-border bg-transparent" onClick={async () => {
                          if (!jobId) return
                          const artifacts = await fetch(`/api/jobs/${jobId}/artifacts`).then(r => r.json())
                          for (const a of artifacts) {
                            if (a.type === "subtitle-srt" || a.type === "subtitle-vtt") {
                              window.open(`/api/artifacts/${a.id}/download`, "_blank")
                            }
                          }
                        }}>
                          <Download className="w-4 h-4 mr-2" />
                          Descarcă subtitrări (45.2 KB)
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Individual Language Downloads */}
                  <div>
                    <h4 className="font-medium text-foreground mb-4">Descarcă pe limbi individuale:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {titlesDescriptions.map((item) => (
                        <Card key={item.language} className="border-border">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{item.flag}</span>
                                <span className="font-medium text-foreground">{item.languageName}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full border-border bg-transparent" onClick={async () => {
                                const artifacts = await fetch(`/api/jobs/${jobId}/artifacts`).then(r => r.json())
                                const srt = artifacts.find((a: any) => a.language === item.language && a.type === "subtitle-srt")
                                if (srt) window.location.href = `/api/artifacts/${srt.id}/download`
                              }}>
                                <Download className="w-3 h-3 mr-2" />
                                Subtitrări
                              </Button>
                              <Button variant="outline" size="sm" className="w-full border-border bg-transparent" onClick={() => {
                                const text = `${item.title}\n\n${item.description}`
                                const blob = new Blob([text], { type: "text/plain" })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement("a")
                                a.href = url
                                a.download = `${item.language}_title_description.txt`
                                a.click()
                                URL.revokeObjectURL(url)
                              }}>
                                <Download className="w-3 h-3 mr-2" />
                                Titlu & Descriere
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
