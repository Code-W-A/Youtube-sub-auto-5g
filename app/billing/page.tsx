"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Globe,
  CreditCard,
  TrendingUp,
  Clock,
  Languages,
  FileVideo,
  Check,
  Star,
  Download,
  Calendar,
} from "lucide-react"

export default function BillingPage() {
  const currentUsage = {
    minutes: { used: 2847, total: 5000 },
    translations: { used: 156, total: 300 },
    projects: { used: 24, total: 50 },
  }

  const billingHistory = [
    {
      id: "1",
      date: "2024-01-01",
      description: "Plan Pro - Ianuarie 2024",
      amount: "€29.99",
      status: "paid",
    },
    {
      id: "2",
      date: "2023-12-01",
      description: "Plan Pro - Decembrie 2023",
      amount: "€29.99",
      status: "paid",
    },
    {
      id: "3",
      date: "2023-11-01",
      description: "Plan Pro - Noiembrie 2023",
      amount: "€29.99",
      status: "paid",
    },
  ]

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

      <main className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Plan și facturare</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Gestionează planul tău și urmărește consumul lunar
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan & Usage */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center text-foreground">
                      <Star className="w-5 h-5 mr-2 text-yellow-500" />
                      Plan Pro
                    </CardTitle>
                    <CardDescription>Plan activ până pe 31 ianuarie 2024</CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Activ</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">€29.99</span>
                  <span className="text-muted-foreground">/lună</span>
                </div>
                <div className="flex space-x-3">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Upgrade la Enterprise
                  </Button>
                  <Button variant="outline" className="bg-transparent">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Actualizează plata
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Consum lunar</CardTitle>
                <CardDescription>Utilizarea curentă pentru ianuarie 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Minute video procesate</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentUsage.minutes.used.toLocaleString()} / {currentUsage.minutes.total.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={(currentUsage.minutes.used / currentUsage.minutes.total) * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Languages className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-medium text-foreground">Traduceri generate</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentUsage.translations.used} / {currentUsage.translations.total}
                      </span>
                    </div>
                    <Progress
                      value={(currentUsage.translations.used / currentUsage.translations.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <FileVideo className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium text-foreground">Proiecte create</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentUsage.projects.used} / {currentUsage.projects.total}
                      </span>
                    </div>
                    <Progress
                      value={(currentUsage.projects.used / currentUsage.projects.total) * 100}
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Resetare consum</h4>
                  <p className="text-sm text-muted-foreground">
                    Consumul se resetează automat pe 1 februarie 2024. Ai încă{" "}
                    <span className="font-medium text-foreground">8 zile</span> până la resetare.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Istoric facturare</CardTitle>
                    <CardDescription>Facturile și plățile recente</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Exportă
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingHistory.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.date).toLocaleDateString("ro-RO", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{item.amount}</p>
                          <Badge variant="outline" className="text-xs">
                            Plătit
                          </Badge>
                        </div>
                      </div>
                      {index < billingHistory.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Plan Comparison */}
          <div className="space-y-6">
            {/* Upgrade Options */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Upgrade disponibil</CardTitle>
                <CardDescription>Crește-ți limitele cu planul Enterprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">€99.99</div>
                  <div className="text-muted-foreground">/lună</div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">20,000 minute/lună</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">1,000 traduceri/lună</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">Proiecte nelimitate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">Suport prioritar</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">API access</span>
                  </div>
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Upgrade acum
                </Button>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Metodă de plată</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expiră 12/2025</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Actualizează cardul
                </Button>
              </CardContent>
            </Card>

            {/* Next Billing */}
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Următoarea factură</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">1 februarie 2024</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plan Pro</span>
                    <span className="font-medium text-foreground">€29.99</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
