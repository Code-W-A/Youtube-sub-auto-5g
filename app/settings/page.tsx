"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Globe, Languages, Youtube, Shield, Trash2, Key, Bell, Download, User } from "lucide-react"

export default function SettingsPage() {
  const [defaultLanguages, setDefaultLanguages] = useState(["en", "fr", "es"])
  const [autoDelete, setAutoDelete] = useState(true)
  const [deletionPeriod, setDeletionPeriod] = useState("30")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [processingNotifications, setProcessingNotifications] = useState(true)

  const AVAILABLE_LANGUAGES = [
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

  const toggleLanguage = (langCode: string) => {
    setDefaultLanguages((prev) =>
      prev.includes(langCode) ? prev.filter((code) => code !== langCode) : [...prev, langCode],
    )
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Setări</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Configurează preferințele și setările contului tău
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <User className="w-5 h-5 mr-2" />
                Cont și profil
              </CardTitle>
              <CardDescription>Gestionează informațiile contului tău</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Nume complet
                  </Label>
                  <Input id="name" defaultValue="Alexandru Popescu" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input id="email" type="email" defaultValue="alexandru@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-foreground">
                  Companie (opțional)
                </Label>
                <Input id="company" defaultValue="Digital Marketing Agency" />
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-white">Salvează modificările</Button>
            </CardContent>
          </Card>

          {/* Language Preferences */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Languages className="w-5 h-5 mr-2" />
                Limbi implicite
              </CardTitle>
              <CardDescription>Selectează limbile care vor fi preselected pentru proiecte noi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {AVAILABLE_LANGUAGES.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      defaultLanguages.includes(lang.code)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-lg">{lang.flag}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lang.name}</p>
                      <p className="text-xs text-muted-foreground uppercase">{lang.code}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultLanguages.map((code) => {
                  const lang = AVAILABLE_LANGUAGES.find((l) => l.code === code)
                  return (
                    <Badge key={code} variant="secondary" className="bg-primary/10 text-primary">
                      {lang?.flag} {lang?.name}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* YouTube Integration */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Youtube className="w-5 h-5 mr-2 text-red-500" />
                Conectare YouTube
              </CardTitle>
              <CardDescription>Gestionează conexiunea cu contul tău YouTube</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Youtube className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Digital Marketing Channel</p>
                    <p className="text-sm text-muted-foreground">alexandru@example.com</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">Conectat</Badge>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="bg-transparent">
                  <Key className="w-4 h-4 mr-2" />
                  Reautentificare
                </Button>
                <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 bg-transparent">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deconectează
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Shield className="w-5 h-5 mr-2" />
                Securitate și confidențialitate
              </CardTitle>
              <CardDescription>Configurează setările de securitate și gestionarea datelor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Ștergere automată fișiere</Label>
                  <p className="text-sm text-muted-foreground">
                    Șterge automat fișierele video și rezultatele după o perioadă specificată
                  </p>
                </div>
                <Switch checked={autoDelete} onCheckedChange={setAutoDelete} />
              </div>

              {autoDelete && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="deletion-period" className="text-foreground">
                    Perioada de păstrare
                  </Label>
                  <Select value={deletionPeriod} onValueChange={setDeletionPeriod}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 zile</SelectItem>
                      <SelectItem value="30">30 zile</SelectItem>
                      <SelectItem value="90">90 zile</SelectItem>
                      <SelectItem value="365">1 an</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-foreground">Gestionare date</h4>
                <div className="flex space-x-3">
                  <Button variant="outline" className="bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Exportă datele
                  </Button>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 bg-transparent">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Șterge contul
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Bell className="w-5 h-5 mr-2" />
                Notificări
              </CardTitle>
              <CardDescription>Configurează preferințele pentru notificări</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Notificări email</Label>
                  <p className="text-sm text-muted-foreground">Primește actualizări prin email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-foreground">Notificări procesare</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifică-mă când proiectele sunt finalizate sau întâmpină erori
                  </p>
                </div>
                <Switch checked={processingNotifications} onCheckedChange={setProcessingNotifications} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
