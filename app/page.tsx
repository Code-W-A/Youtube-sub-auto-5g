"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileVideo, Download, Play, Package, Eye, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import JSZip from "jszip"

const SUPPORTED_LANGUAGES = [
  { code: "sq", name: "Albaneză" },
  { code: "ar", name: "Arabă" },
  { code: "bs", name: "Bosniacă" },
  { code: "bg", name: "Bulgară" },
  { code: "cs", name: "Cehă" },
  { code: "zh", name: "Chineză" },
  { code: "ko", name: "Coreeană" },
  { code: "co", name: "Corsicană" },
  { code: "hr", name: "Croată" },
  { code: "da", name: "Daneză" },
  { code: "he", name: "Ebraică" },
  { code: "en", name: "Engleză" },
  { code: "et", name: "Estonă" },
  { code: "fi", name: "Finlandeză" },
  { code: "fr", name: "Franceză" },
  { code: "ka", name: "Georgiană" },
  { code: "de", name: "Germană" },
  { code: "el", name: "Greacă" },
  { code: "id", name: "Indoneziană" },
  { code: "it", name: "Italiană" },
  { code: "ja", name: "Japoneză" },
  { code: "lv", name: "Letonă" },
  { code: "lt", name: "Lituaniană" },
  { code: "mk", name: "Macedoneană" },
  { code: "hu", name: "Maghiară" },
  { code: "mn", name: "Mongolă" },
  { code: "nl", name: "Neerlandeză" },
  { code: "no", name: "Norvegiană" },
  { code: "fa", name: "Persană" },
  { code: "pl", name: "Poloneză" },
  { code: "pt", name: "Portugheză" },
  { code: "ro", name: "Română" },
  { code: "ru", name: "Rusă" },
  { code: "sr", name: "Sârbă" },
  { code: "sk", name: "Slovacă" },
  { code: "sl", name: "Slovenă" },
  { code: "es", name: "Spaniolă" },
  { code: "sv", name: "Suedeză" },
  { code: "th", name: "Thailandeză" },
  { code: "tr", name: "Turcă" },
  { code: "vi", name: "Vietnameză" },
]

type ArtifactType = "subtitle-srt"

type ApiArtifact = {
  language: string
  filename: string
  contentType: string
  type: ArtifactType
  sizeBytes: number
  content: string
}

export default function LocalizeStudio() {
  const { toast } = useToast()

  const [selectedSrt, setSelectedSrt] = useState<File | null>(null)
  const [selectedSbv, setSelectedSbv] = useState<File | null>(null)
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["en", "fr"]) // default like UI
  const [sourceLanguage] = useState("auto")
  const [generateSubtitles] = useState(true)
  const [generateTranslations] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phase, setPhase] = useState<"idle" | "processing" | "done" | "error">("idle")
  const [progress, setProgress] = useState(0)
  const progressTimerRef = useRef<number | null>(null)

  const [projectTitle, setProjectTitle] = useState<string>("Rezultate procesare")
  const [transcriptInfo, setTranscriptInfo] = useState<string>("")
  const [artifacts, setArtifacts] = useState<ApiArtifact[]>([])
  const [translatedMeta, setTranslatedMeta] = useState<Array<{ language: string; title: string; description: string }>>([])

  const handleSrtSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.name.toLowerCase().endsWith(".srt")) setSelectedSrt(f)
  }
  const handleSbvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f && f.name.toLowerCase().endsWith(".sbv")) setSelectedSbv(f)
  }

  const toggleLanguage = (langCode: string) => {
    setTargetLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((c) => c !== langCode) : [...prev, langCode],
    )
  }

  const selectAllLanguages = () => {
    setTargetLanguages(SUPPORTED_LANGUAGES.map((l) => l.code))
  }

  const clearAllLanguages = () => {
    setTargetLanguages([])
  }

  const canProcess = Boolean((selectedSrt || selectedSbv) && targetLanguages.length >= 0)

  const languageMeta: Record<string, { name: string; flag: string }> = useMemo(
    () => ({
      sq: { name: "Albaneză", flag: "🇦🇱" },
      ar: { name: "Arabă", flag: "🇸🇦" },
      bs: { name: "Bosniacă", flag: "🇧🇦" },
      bg: { name: "Bulgară", flag: "🇧🇬" },
      cs: { name: "Cehă", flag: "🇨🇿" },
      zh: { name: "Chineză", flag: "🇨🇳" },
      ko: { name: "Coreeană", flag: "🇰🇷" },
      co: { name: "Corsicană", flag: "🇫🇷" },
      hr: { name: "Croată", flag: "🇭🇷" },
      da: { name: "Daneză", flag: "🇩🇰" },
      he: { name: "Ebraică", flag: "🇮🇱" },
      en: { name: "Engleză", flag: "🇺🇸" },
      et: { name: "Estonă", flag: "🇪🇪" },
      fi: { name: "Finlandeză", flag: "🇫🇮" },
      fr: { name: "Franceză", flag: "🇫🇷" },
      ka: { name: "Georgiană", flag: "🇬🇪" },
      de: { name: "Germană", flag: "🇩🇪" },
      el: { name: "Greacă", flag: "🇬🇷" },
      id: { name: "Indoneziană", flag: "🇮🇩" },
      it: { name: "Italiană", flag: "🇮🇹" },
      ja: { name: "Japoneză", flag: "🇯🇵" },
      lv: { name: "Letonă", flag: "🇱🇻" },
      lt: { name: "Lituaniană", flag: "🇱🇹" },
      mk: { name: "Macedoneană", flag: "🇲🇰" },
      hu: { name: "Maghiară", flag: "🇭🇺" },
      mn: { name: "Mongolă", flag: "🇲🇳" },
      nl: { name: "Neerlandeză", flag: "🇳🇱" },
      no: { name: "Norvegiană", flag: "🇳🇴" },
      fa: { name: "Persană", flag: "🇮🇷" },
      pl: { name: "Poloneză", flag: "🇵🇱" },
      pt: { name: "Portugheză", flag: "🇵🇹" },
      ro: { name: "Română", flag: "🇷🇴" },
      ru: { name: "Rusă", flag: "🇷🇺" },
      sr: { name: "Sârbă", flag: "🇷🇸" },
      sk: { name: "Slovacă", flag: "🇸🇰" },
      sl: { name: "Slovenă", flag: "🇸🇮" },
      es: { name: "Spaniolă", flag: "🇪🇸" },
      sv: { name: "Suedeză", flag: "🇸🇪" },
      th: { name: "Thailandeză", flag: "🇹🇭" },
      tr: { name: "Turcă", flag: "🇹🇷" },
      vi: { name: "Vietnameză", flag: "🇻🇳" },
    }),
    [],
  )

  const subtitleFiles = useMemo(() => {
    const subs: Array<{ language: string; languageName: string; flag: string; srt?: ApiArtifact; sizeLabel: string }> = []
    const byLang: Record<string, { srt?: ApiArtifact }> = {}
    for (const a of artifacts) {
      if (a.type === "subtitle-srt") {
        byLang[a.language] = byLang[a.language] || {}
        byLang[a.language].srt = a
      }
    }
    for (const [lang, files] of Object.entries(byLang)) {
      const meta = languageMeta[lang] || { name: lang.toUpperCase(), flag: "🌐" }
      const sizeBytes = (files.srt?.sizeBytes || 0)
      subs.push({
        language: lang,
        languageName: meta.name,
        flag: meta.flag,
        srt: files.srt,
        sizeLabel: `${Math.max(1, Math.round(sizeBytes / 1024))} KB`,
      })
    }
    return subs.sort((a, b) => a.language.localeCompare(b.language))
  }, [artifacts, languageMeta])

  useEffect(() => {
    if (phase !== "processing") return
    // Simulate progress while server works
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      // Ease towards 95%
      const next = Math.min(95, Math.floor(100 * (1 - Math.exp(-elapsed / 6))))
      setProgress(next)
      progressTimerRef.current = window.setTimeout(tick, 500) as unknown as number
    }
    tick()
    return () => {
      if (progressTimerRef.current) window.clearTimeout(progressTimerRef.current)
    }
  }, [phase])

  const downloadAllAsZip = async () => {
    try {
      const zip = new JSZip()
      const rootName = (projectTitle || "proiect").toLowerCase().replace(/[^a-z0-9_\-]+/g, "_")
      const subsFolder = zip.folder(`${rootName}/Subtitrari`)
      for (const a of artifacts) {
        if (a.type === "subtitle-srt") subsFolder?.file(a.filename, a.content)
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `${rootName}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: "Eroare la arhivare", description: "Nu s-a putut crea arhiva .zip", variant: "destructive" })
    }
  }

  const handleProcess = async () => {
    if (!canProcess || isSubmitting) return
    setIsSubmitting(true)
    setPhase("processing")
    setProgress(0)
    try {
      console.log("[client] submit start", { hasSrt: Boolean(selectedSrt), hasSbv: Boolean(selectedSbv), targets: targetLanguages.length })
      const payload: any = {
        title: selectedSrt?.name || selectedSbv?.name,
        metaTitle,
        metaDescription,
        sourceLanguage,
        targetLanguages,
        generateSubtitles,
        generateTranslations,
      }
      if (selectedSrt) {
        const txt = await selectedSrt.text()
        payload.srtContent = txt
      } else if (selectedSbv) {
        const txt = await selectedSbv.text()
        payload.sbvContent = txt
      }
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Import failed")
      const data: { title: string; transcriptSource?: string; artifacts: ApiArtifact[]; titlesDescriptions?: Array<{ language: string; title: string; description: string }> } = await res.json()
      console.log("[client] process done", { artifacts: data.artifacts?.length || 0 })
      setProjectTitle(data.title || "Rezultate procesare")
      const src = data.transcriptSource
      let info = ""
      if (src === "captions") info = "Sursă transcript: Captions"
      else if (src === "stt") info = "Sursă transcript: STT (fallback)"
      else if (src === "sample") info = "Sursă transcript: Eșantion (demo)"
      else if (src === "uploaded") info = "Sursă transcript: SRT încărcat"
      else info = "Sursă transcript: Necunoscut"
      setTranscriptInfo(info)
      setArtifacts(data.artifacts || [])
      setTranslatedMeta(data.titlesDescriptions || [])
      setProgress(100)
      setPhase("done")
    } catch (e: any) {
      console.error("[client] process error", e)
      toast({
        title: "Eroare la pornirea procesării",
        description: e?.message || "Încearcă din nou.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setPhase("error")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* SRT Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">1. Import SRT</CardTitle>
                <CardDescription>Încarcă fișier .srt</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">sau drag & drop fișier .srt aici</p>
                  <input id="main-srt-upload" type="file" accept=".srt" className="hidden" onChange={handleSrtSelect} />
                  <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                    <label htmlFor="main-srt-upload" className="cursor-pointer">Selectează fișier</label>
                  </Button>
                  {selectedSrt && (
                    <div className="mt-2 text-xs text-muted-foreground">Selectat: {selectedSrt.name}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SBV Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">1.1 Import SBV</CardTitle>
                <CardDescription>Încarcă fișier .sbv (YouTube)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">sau drag & drop fișier .sbv aici</p>
                  <input id="main-sbv-upload" type="file" accept=".sbv" className="hidden" onChange={handleSbvSelect} />
                  <Button asChild variant="outline" size="sm" className="mt-2 bg-transparent">
                    <label htmlFor="main-sbv-upload" className="cursor-pointer">Selectează fișier</label>
                  </Button>
                  {selectedSbv && (
                    <div className="mt-2 text-xs text-muted-foreground">Selectat: {selectedSbv.name}</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">2. Selectează limbile pentru traducere</CardTitle>
                <CardDescription>Alege limbile în care vrei să traduci subtitrările și titlul</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Title & Description Inputs */}
                <div className="space-y-3 mb-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground">Titlu (opțional)</Label>
                    <Input placeholder="Titlu pentru traducere" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-foreground">Descriere (opțional)</Label>
                    <Textarea placeholder="Descriere pentru traducere" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-end mb-3">
                  <Button variant="outline" size="sm" onClick={selectAllLanguages} className="bg-transparent mr-2">
                    Selectează toate
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllLanguages} className="bg-transparent">
                    Șterge toate
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const selected = targetLanguages.includes(lang.code)
                    return (
                      <div
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          selected ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground",
                        )}
                      >
                        <div className="font-medium text-sm text-foreground">{lang.code.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">{lang.name}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Processing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">3. Opțiuni procesare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Calitate subtitrări</Label>
                    <Select defaultValue="high">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">Înaltă calitate</SelectItem>
                        <SelectItem value="premium">Premium (cu corecții manuale)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Format export</Label>
                    <Select defaultValue="srt">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="srt">.srt (SubRip)</SelectItem>
                        <SelectItem value="vtt">.vtt (WebVTT)</SelectItem>
                        <SelectItem value="both">Ambele formate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div> */}

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!canProcess || isSubmitting}
                  onClick={handleProcess}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {phase === "processing" ? "Procesez..." : "Începe procesarea"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Current Job Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Status curent</CardTitle>
              </CardHeader>
              <CardContent>
                {phase === "processing" ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Play className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Procesare în curs...</p>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-2 bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
                  </div>
                ) : phase === "done" ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm text-foreground">Procesare completă</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileVideo className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Niciun job în procesare</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Files */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Fișiere recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "tutorial-marketing.srt", date: "Azi, 14:30", languages: ["EN", "FR"] },
                  { name: "prezentare-produs.srt", date: "Ieri, 16:45", languages: ["EN", "DE", "ES"] },
                  { name: "webinar-tech.srt", date: "3 zile în urmă", languages: ["EN"] },
                ].map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.date}</p>
                      <div className="flex gap-1 mt-1">
                        {file.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card> */}

            {/* Quick Stats */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Statistici</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Fișiere procesate</span>
                  <span className="text-sm font-medium text-foreground">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Limbi generate</span>
                  <span className="text-sm font-medium text-foreground">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Linii subtitrare</span>
                  <span className="text-sm font-medium text-foreground">12,430</span>
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>

        {phase === "done" && (
          <div className="mt-8 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">{projectTitle}</CardTitle>
                    {transcriptInfo && (
                      <CardDescription className="text-xs">{transcriptInfo}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Complet</Badge>
                    <Button className="bg-primary hover:bg-primary/90 text-white" onClick={downloadAllAsZip}>
                      <Package className="w-4 h-4 mr-2" />
                      Descarcă toate
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Subtitrări (doar SRT) */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Subtitrări</CardTitle>
                <CardDescription>Fișiere .srt generate (corectate și traduse)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {subtitleFiles.map((f) => (
                    <div key={f.language} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{f.flag}</div>
                        <div>
                          <div className="text-sm text-foreground font-medium">{f.languageName}</div>
                          <div className="text-xs text-muted-foreground">{f.sizeLabel}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border bg-transparent"
                          onClick={() => {
                            const srt = f.srt?.content || ""
                            if (!srt) {
                              toast({ title: "Subtitrare lipsă", description: "Nu există .srt pentru această limbă", variant: "destructive" })
                              return
                            }
                            const preview = srt.slice(0, 200) + (srt.length > 200 ? "..." : "")
                            toast({ title: `Preview ${f.language.toUpperCase()}`, description: preview })
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border bg-transparent"
                          onClick={() => {
                            if (f.srt) {
                              const blob = new Blob([f.srt.content], { type: f.srt.contentType })
                              const url = URL.createObjectURL(blob)
                              const a = document.createElement("a")
                              a.href = url
                              a.download = f.srt.filename
                              a.click()
                              URL.revokeObjectURL(url)
                            }
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          .srt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Titluri & Descrieri traduse */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Titluri & Descrieri traduse</CardTitle>
                <CardDescription>Copiere rapidă pentru fiecare limbă</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {translatedMeta.map((item) => (
                    <Card key={item.language} className="border-border">
                      <CardHeader>
                        <CardTitle className="text-foreground">{item.language.toUpperCase()}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm text-foreground">Titlu</Label>
                          <div className="p-3 bg-muted border border-border rounded text-sm text-foreground">
                            {item.title}
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 border-border bg-transparent" onClick={async () => {
                            await navigator.clipboard.writeText(item.title)
                          }}>Copiază titlul</Button>
                        </div>
                        <div>
                          <Label className="text-sm text-foreground">Descriere</Label>
                          <div className="p-3 bg-muted border border-border rounded text-sm text-foreground max-h-[180px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans">{item.description}</pre>
                          </div>
                          <Button variant="outline" size="sm" className="mt-2 border-border bg-transparent" onClick={async () => {
                            await navigator.clipboard.writeText(item.description)
                          }}>Copiază descrierea</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
