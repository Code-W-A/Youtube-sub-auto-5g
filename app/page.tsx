"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileVideo, Download, Play } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "ja", name: "日本語" },
]

export default function LocalizeStudio() {
  const router = useRouter()
  const { toast } = useToast()

  const [selectedSrt, setSelectedSrt] = useState<File | null>(null)
  const [selectedSbv, setSelectedSbv] = useState<File | null>(null)
  const [targetLanguages, setTargetLanguages] = useState<string[]>(["en", "fr"]) // default like UI
  const [sourceLanguage] = useState("auto")
  const [generateSubtitles] = useState(true)
  const [generateTranslations] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const canProcess = Boolean((selectedSrt || selectedSbv) && targetLanguages.length >= 0)

  const handleProcess = async () => {
    if (!canProcess || isSubmitting) return
    setIsSubmitting(true)
    try {
      const payload: any = {
        filename: selectedSrt?.name,
        title: selectedSrt?.name || selectedSbv?.name,
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
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Import failed")
      const data = await res.json()
      router.push(`/processing?jobId=${encodeURIComponent(data.jobId)}`)
    } catch (e: any) {
      toast({
        title: "Eroare la pornirea procesării",
        description: e?.message || "Încearcă din nou.",
        variant: "destructive",
      })
      setIsSubmitting(false)
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!canProcess || isSubmitting}
                  onClick={handleProcess}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Se pornește..." : "Începe procesarea"}
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
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileVideo className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Niciun job în procesare</p>
                </div>
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
      </main>
    </div>
  )
}
