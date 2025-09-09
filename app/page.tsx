import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Youtube, FileVideo, Download, Play } from "lucide-react"

export default function LocalizeStudio() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Video Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">1. Import Video</CardTitle>
                <CardDescription>Adaugă link YouTube sau încarcă fișier video</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url" className="text-sm font-medium text-foreground">
                    YouTube URL
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input id="youtube-url" placeholder="https://youtube.com/watch?v=..." className="flex-1" />
                    <Button variant="outline" size="sm">
                      <Youtube className="w-4 h-4 mr-1" />
                      Import
                    </Button>
                  </div>
                </div>

                <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">sau drag & drop fișier video aici</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    Selectează fișier
                  </Button>
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
                  {[
                    { code: "EN", name: "English", selected: true },
                    { code: "FR", name: "Français", selected: true },
                    { code: "ES", name: "Español", selected: false },
                    { code: "DE", name: "Deutsch", selected: false },
                    { code: "IT", name: "Italiano", selected: false },
                    { code: "PT", name: "Português", selected: false },
                    { code: "RU", name: "Русский", selected: false },
                    { code: "JA", name: "日本語", selected: false },
                  ].map((lang) => (
                    <div
                      key={lang.code}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        lang.selected ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className="font-medium text-sm text-foreground">{lang.code}</div>
                      <div className="text-xs text-muted-foreground">{lang.name}</div>
                    </div>
                  ))}
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

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Play className="w-4 h-4 mr-2" />
                  Începe procesarea
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Fișiere recente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "tutorial-marketing.mp4", date: "Azi, 14:30", languages: ["EN", "FR"] },
                  { name: "prezentare-produs.mp4", date: "Ieri, 16:45", languages: ["EN", "DE", "ES"] },
                  { name: "webinar-tech.mp4", date: "3 zile în urmă", languages: ["EN"] },
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
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Statistici</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Videoclipuri procesate</span>
                  <span className="text-sm font-medium text-foreground">24</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Limbi generate</span>
                  <span className="text-sm font-medium text-foreground">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Minute totale</span>
                  <span className="text-sm font-medium text-foreground">2,847</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
