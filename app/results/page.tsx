"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Download, Copy, CheckCircle, FileText, Youtube, Package, Eye, Edit3, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [editingDescription, setEditingDescription] = useState<string | null>(null)

  const [subtitleFiles] = useState<SubtitleFile[]>([
    {
      language: "ro",
      languageName: "Română",
      flag: "🇷🇴",
      format: "srt",
      size: "12.4 KB",
      preview: "1\n00:00:01,000 --> 00:00:04,000\nBună ziua și bun venit la acest tutorial...",
    },
    {
      language: "en",
      languageName: "English",
      flag: "🇺🇸",
      format: "srt",
      size: "11.8 KB",
      preview: "1\n00:00:01,000 --> 00:00:04,000\nHello and welcome to this tutorial...",
    },
    {
      language: "fr",
      languageName: "Français",
      flag: "🇫🇷",
      format: "srt",
      size: "13.1 KB",
      preview: "1\n00:00:01,000 --> 00:00:04,000\nBonjour et bienvenue dans ce tutoriel...",
    },
    {
      language: "es",
      languageName: "Español",
      flag: "🇪🇸",
      format: "srt",
      size: "12.7 KB",
      preview: "1\n00:00:01,000 --> 00:00:04,000\nHola y bienvenidos a este tutorial...",
    },
    {
      language: "de",
      languageName: "Deutsch",
      flag: "🇩🇪",
      format: "srt",
      size: "13.5 KB",
      preview: "1\n00:00:01,000 --> 00:00:04,000\nHallo und willkommen zu diesem Tutorial...",
    },
  ])

  const [titlesDescriptions, setTitlesDescriptions] = useState<TitleDescription[]>([
    {
      language: "ro",
      languageName: "Română",
      flag: "🇷🇴",
      title: "Tutorial Complet Marketing Digital 2024 - Strategii Eficiente pentru Afacerea Ta",
      description:
        "Descoperă cele mai eficiente strategii de marketing digital în 2024! În acest tutorial complet, vei învăța cum să îți promovezi afacerea online, să atragi clienți noi și să îți crești vânzările folosind tehnicile moderne de marketing.\n\n🎯 Ce vei învăța:\n• Strategii SEO avansate\n• Marketing pe rețelele sociale\n• Publicitate online eficientă\n• Analiza competiției\n• Optimizarea conversiilor\n\n📈 Perfect pentru antreprenori, freelanceri și specialiști în marketing care vor să își dezvolte cunoștințele și să obțină rezultate concrete.\n\n#MarketingDigital #Antreprenoriat #SEO #SocialMedia #Afaceri",
      titleMaxLength: 100,
      descriptionMaxLength: 5000,
    },
    {
      language: "en",
      languageName: "English",
      flag: "🇺🇸",
      title: "Complete Digital Marketing Tutorial 2024 - Effective Strategies for Your Business",
      description:
        "Discover the most effective digital marketing strategies in 2024! In this comprehensive tutorial, you'll learn how to promote your business online, attract new customers, and increase your sales using modern marketing techniques.\n\n🎯 What you'll learn:\n• Advanced SEO strategies\n• Social media marketing\n• Effective online advertising\n• Competitor analysis\n• Conversion optimization\n\n📈 Perfect for entrepreneurs, freelancers, and marketing specialists who want to develop their knowledge and achieve concrete results.\n\n#DigitalMarketing #Entrepreneurship #SEO #SocialMedia #Business",
      titleMaxLength: 100,
      descriptionMaxLength: 5000,
    },
    {
      language: "fr",
      languageName: "Français",
      flag: "🇫🇷",
      title: "Tutoriel Marketing Digital Complet 2024 - Stratégies Efficaces pour Votre Entreprise",
      description:
        "Découvrez les stratégies de marketing digital les plus efficaces en 2024 ! Dans ce tutoriel complet, vous apprendrez comment promouvoir votre entreprise en ligne, attirer de nouveaux clients et augmenter vos ventes en utilisant les techniques marketing modernes.\n\n🎯 Ce que vous apprendrez :\n• Stratégies SEO avancées\n• Marketing sur les réseaux sociaux\n• Publicité en ligne efficace\n• Analyse de la concurrence\n• Optimisation des conversions\n\n📈 Parfait pour les entrepreneurs, freelances et spécialistes marketing qui souhaitent développer leurs connaissances et obtenir des résultats concrets.\n\n#MarketingDigital #Entrepreneuriat #SEO #ReseauxSociaux #Entreprise",
      titleMaxLength: 100,
      descriptionMaxLength: 5000,
    },
    {
      language: "es",
      languageName: "Español",
      flag: "🇪🇸",
      title: "Tutorial Completo Marketing Digital 2024 - Estrategias Efectivas para Tu Negocio",
      description:
        "¡Descubre las estrategias de marketing digital más efectivas en 2024! En este tutorial completo, aprenderás cómo promocionar tu negocio online, atraer nuevos clientes y aumentar tus ventas usando técnicas modernas de marketing.\n\n🎯 Lo que aprenderás:\n• Estrategias SEO avanzadas\n• Marketing en redes sociales\n• Publicidad online efectiva\n• Análisis de competencia\n• Optimización de conversiones\n\n📈 Perfecto para emprendedores, freelancers y especialistas en marketing que quieren desarrollar sus conocimientos y obtener resultados concretos.\n\n#MarketingDigital #Emprendimiento #SEO #RedesSociales #Negocios",
      titleMaxLength: 100,
      descriptionMaxLength: 5000,
    },
    {
      language: "de",
      languageName: "Deutsch",
      flag: "🇩🇪",
      title: "Komplettes Digital Marketing Tutorial 2024 - Effektive Strategien für Ihr Unternehmen",
      description:
        "Entdecken Sie die effektivsten Digital Marketing Strategien für 2024! In diesem umfassenden Tutorial lernen Sie, wie Sie Ihr Unternehmen online bewerben, neue Kunden gewinnen und Ihre Verkäufe mit modernen Marketing-Techniken steigern.\n\n🎯 Was Sie lernen werden:\n• Fortgeschrittene SEO-Strategien\n• Social Media Marketing\n• Effektive Online-Werbung\n• Konkurrenzanalyse\n• Conversion-Optimierung\n\n📈 Perfekt für Unternehmer, Freelancer und Marketing-Spezialisten, die ihr Wissen erweitern und konkrete Ergebnisse erzielen möchten.\n\n#DigitalMarketing #Unternehmertum #SEO #SocialMedia #Business",
      titleMaxLength: 100,
      descriptionMaxLength: 5000,
    },
  ])

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
                <h2 className="text-2xl font-semibold text-foreground">Tutorial Marketing Digital</h2>
                <p className="text-muted-foreground">youtube.com/watch?v=abc123 • 12:34 min • Finalizat cu succes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle className="w-4 h-4 mr-1" />
                Procesare completă
              </Badge>
              <Button className="bg-primary hover:bg-primary/90 text-white">
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
                    <p className="text-lg font-medium text-foreground">5 limbi</p>
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
                    <p className="text-lg font-medium text-foreground">5 limbi</p>
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
                    <p className="text-lg font-medium text-foreground">63.5 KB</p>
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
                    <p className="text-lg font-medium text-foreground">8 min 32s</p>
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
                  {subtitleFiles.map((file) => (
                    <div
                      key={file.language}
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
                        <Button variant="outline" size="sm" className="border-border bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="border-border bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          .srt
                        </Button>
                        <Button variant="outline" size="sm" className="border-border bg-transparent">
                          <Download className="w-4 h-4 mr-2" />
                          .vtt
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
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
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white">
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
                        <Button variant="outline" className="w-full border-border bg-transparent">
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
                              <Button variant="outline" size="sm" className="w-full border-border bg-transparent">
                                <Download className="w-3 h-3 mr-2" />
                                Subtitrări
                              </Button>
                              <Button variant="outline" size="sm" className="w-full border-border bg-transparent">
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
