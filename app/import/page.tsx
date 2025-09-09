"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Youtube, Globe, ArrowLeft, Check, X, Languages, FileVideo, Link, Play } from "lucide-react"
import { cn } from "@/lib/utils"

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export default function ImportPage() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState("auto")
  const [targetLanguages, setTargetLanguages] = useState<string[]>([])
  const [generateSubtitles, setGenerateSubtitles] = useState(true)
  const [generateTranslations, setGenerateTranslations] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/)|youtu\.be\/)[\w-]+/i
    return youtubeRegex.test(url)
  }

  const handleUrlChange = (value: string) => {
    setYoutubeUrl(value)
    if (value.trim()) {
      setIsValidUrl(validateYouTubeUrl(value))
    } else {
      setIsValidUrl(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(
      (file) =>
        file.type.startsWith("video/") ||
        [".mp4", ".mov", ".avi", ".mkv"].some((ext) => file.name.toLowerCase().endsWith(ext)),
    )
    if (videoFile) {
      setSelectedFile(videoFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const toggleLanguage = (langCode: string) => {
    setTargetLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((code) => code !== langCode) : [...prev, langCode],
    )
  }

  const selectAllLanguages = () => {
    setTargetLanguages(SUPPORTED_LANGUAGES.map((lang) => lang.code))
  }

  const clearAllLanguages = () => {
    setTargetLanguages([])
  }

  const canProcess = (youtubeUrl && isValidUrl) || selectedFile

  const handleProcess = async () => {
    if (!canProcess || isSubmitting) return
    setIsSubmitting(true)
    try {
      // For now, if file is selected we only send filename metadata.
      // Actual file upload endpoint can be added later if needed.
      const payload: any = {
        youtubeUrl: isValidUrl ? youtubeUrl : undefined,
        filename: selectedFile?.name,
        title: selectedFile?.name || youtubeUrl,
        sourceLanguage,
        targetLanguages,
        generateSubtitles,
        generateTranslations,
      }
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error("Import failed")
      const data = await res.json()
      const jobId = data.jobId as string
      router.push(`/processing?jobId=${encodeURIComponent(jobId)}`)
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Eroare la pornirea procesării",
        description: e?.message || "Încearcă din nou sau verifică link-ul YouTube.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Dashboard
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Localize Studio</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Import video</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Adaugă un link YouTube sau încarcă un fișier video pentru a începe procesarea
          </p>
        </div>

        <div className="space-y-8">
          {/* YouTube URL Input */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Youtube className="w-5 h-5 mr-2 text-red-500" />
                Link YouTube
              </CardTitle>
              <CardDescription>Lipește URL-ul videoclipului YouTube pe care vrei să-l procesezi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={cn(
                      "pr-10",
                      isValidUrl === true && "border-green-500",
                      isValidUrl === false && "border-red-500",
                    )}
                  />
                  {isValidUrl !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidUrl ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <X className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <Button variant="outline" disabled={!isValidUrl} className="bg-transparent">
                  <Link className="w-4 h-4 mr-2" />
                  Verifică
                </Button>
              </div>
              {isValidUrl === false && (
                <p className="text-sm text-red-500">URL YouTube invalid. Te rog verifică linkul.</p>
              )}
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Upload className="w-5 h-5 mr-2" />
                Încarcă fișier video
              </CardTitle>
              <CardDescription>Suportăm formate .mp4, .mov, .avi, .mkv (max 500MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  isDragOver ? "border-primary bg-primary/5" : "border-border",
                  selectedFile && "border-green-500 bg-green-50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileVideo className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="bg-transparent"
                    >
                      Schimbă fișierul
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground">
                        Trage un fișier aici sau lipește un link YouTube
                      </p>
                      <p className="text-muted-foreground">Selectează un videoclip pentru a începe procesarea</p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="video/*,.mp4,.mov,.avi,.mkv"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                      />
                      <Button variant="outline" asChild className="bg-transparent">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Selectează fișier
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Languages className="w-5 h-5 mr-2" />
                Setări limbă
              </CardTitle>
              <CardDescription>Configurează limba sursă și limbile țintă pentru traduceri</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Source Language */}
              <div className="space-y-2">
                <Label htmlFor="source-language" className="text-foreground">
                  Limba sursă
                </Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează limba sursă" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🤖 Detectare automată</SelectItem>
                    <SelectItem value="ro">🇷🇴 Română</SelectItem>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Languages */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground">Limbi țintă pentru traduceri</Label>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={selectAllLanguages} className="bg-transparent">
                      Selectează toate
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAllLanguages} className="bg-transparent">
                      Șterge toate
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => toggleLanguage(lang.code)}
                      className={cn(
                        "flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors",
                        targetLanguages.includes(lang.code)
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50",
                      )}
                    >
                      <div className="text-lg">{lang.flag}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{lang.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{lang.code}</p>
                      </div>
                      {targetLanguages.includes(lang.code) && <Check className="w-4 h-4 text-primary" />}
                    </div>
                  ))}
                </div>
                {targetLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {targetLanguages.map((code) => {
                      const lang = SUPPORTED_LANGUAGES.find((l) => l.code === code)
                      return (
                        <Badge key={code} variant="secondary" className="bg-primary/10 text-primary">
                          {lang?.flag} {lang?.name}
                        </Badge>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Processing Options */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-foreground">Opțiuni procesare</CardTitle>
              <CardDescription>Configurează ce vrei să generezi pentru videoclipul tău</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Generează subtitrare română</Label>
                  <p className="text-sm text-muted-foreground">Creează subtitrări corecte în română cu diacritice</p>
                </div>
                <Switch checked={generateSubtitles} onCheckedChange={setGenerateSubtitles} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Generează traduceri</Label>
                  <p className="text-sm text-muted-foreground">Traduce subtitrările și generează titluri + descrieri</p>
                </div>
                <Switch checked={generateTranslations} onCheckedChange={setGenerateTranslations} />
              </div>
            </CardContent>
          </Card>

          {/* Process Button */}
          <div className="text-center">
            <Button
              size="lg"
              disabled={!canProcess || isSubmitting}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-12 py-3 text-lg"
              onClick={handleProcess}
            >
              <Play className="w-5 h-5 mr-2" />
              {isSubmitting ? "Se pornește..." : "Procesează videoclipul"}
            </Button>
            {!canProcess && (
              <p className="text-sm text-muted-foreground mt-2">
                Adaugă un link YouTube valid sau încarcă un fișier video pentru a continua
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
