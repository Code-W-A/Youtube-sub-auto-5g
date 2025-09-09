"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Globe,
  Search,
  Play,
  Youtube,
  FileVideo,
  Download,
  Eye,
  Trash2,
  Calendar,
  Clock,
} from "lucide-react"

interface Project {
  id: string
  title: string
  type: "youtube" | "upload"
  url?: string
  filename?: string
  status: "completed" | "processing" | "failed"
  languages: string[]
  duration: string
  createdAt: string
  completedAt?: string
  thumbnail: string
  size?: string
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [projects] = useState<Project[]>([
    {
      id: "1",
      title: "Tutorial Marketing Digital",
      type: "youtube",
      url: "youtube.com/watch?v=abc123",
      status: "completed",
      languages: ["RO", "EN", "FR", "ES", "DE"],
      duration: "12:34",
      createdAt: "2024-01-15T10:30:00Z",
      completedAt: "2024-01-15T10:38:32Z",
      thumbnail: "/placeholder-jisiy.png",
    },
    {
      id: "2",
      title: "Prezentare Produs 2024",
      type: "upload",
      filename: "prezentare_produs.mp4",
      status: "processing",
      languages: ["RO", "EN", "DE"],
      duration: "8:45",
      createdAt: "2024-01-15T09:15:00Z",
      thumbnail: "/placeholder-69zlt.png",
      size: "245 MB",
    },
    {
      id: "3",
      title: "Webinar Tehnologie",
      type: "youtube",
      url: "youtube.com/watch?v=xyz789",
      status: "completed",
      languages: ["RO", "EN"],
      duration: "45:12",
      createdAt: "2024-01-14T14:20:00Z",
      completedAt: "2024-01-14T14:35:45Z",
      thumbnail: "/placeholder-tbeor.png",
    },
    {
      id: "4",
      title: "Tutorial Photoshop",
      type: "upload",
      filename: "photoshop_tutorial.mov",
      status: "failed",
      languages: ["RO", "EN", "FR"],
      duration: "15:23",
      createdAt: "2024-01-14T11:45:00Z",
      thumbnail: "/placeholder-7qeka.png",
      size: "1.2 GB",
    },
    {
      id: "5",
      title: "Curs Excel Avansat",
      type: "youtube",
      url: "youtube.com/watch?v=def456",
      status: "completed",
      languages: ["RO", "EN", "ES", "IT"],
      duration: "32:18",
      createdAt: "2024-01-13T16:10:00Z",
      completedAt: "2024-01-13T16:25:30Z",
      thumbnail: "/placeholder-mfc8k.png",
    },
    {
      id: "6",
      title: "Live Stream Gaming",
      type: "youtube",
      url: "youtube.com/watch?v=ghi789",
      status: "completed",
      languages: ["RO", "EN"],
      duration: "2:15:45",
      createdAt: "2024-01-12T20:00:00Z",
      completedAt: "2024-01-12T20:18:22Z",
      thumbnail: "/gaming-stream-thumbnail.png",
    },
  ])

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesType = typeFilter === "all" || project.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Project["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 border-green-200">Finalizat</Badge>
      case "processing":
        return <Badge className="bg-primary/10 text-primary border-primary/20">În procesare</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Eșuat</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Istoric proiecte</h2>
          <p className="text-lg text-muted-foreground text-pretty">
            Vizualizează și gestionează toate proiectele tale de localizare
          </p>
        </div>

        {/* Filters */}
        <Card className="border-border shadow-sm mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Caută proiecte..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="completed">Finalizate</SelectItem>
                    <SelectItem value="processing">În procesare</SelectItem>
                    <SelectItem value="failed">Eșuate</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tip" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toate</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="upload">Încărcare</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img
                  src={project.thumbnail || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2">{getStatusBadge(project.status)}</div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {project.duration}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground text-balance line-clamp-2">{project.title}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {project.type === "youtube" ? (
                        <Youtube className="w-4 h-4 text-red-500" />
                      ) : (
                        <FileVideo className="w-4 h-4 text-blue-500" />
                      )}
                      <span className="text-sm text-muted-foreground truncate">
                        {project.type === "youtube" ? project.url : project.filename}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {project.languages.map((lang) => (
                      <Badge key={lang} variant="outline" className="text-xs">
                        {lang}
                      </Badge>
                    ))}
                  </div>

                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Creat: {formatDate(project.createdAt)}</span>
                    </div>
                    {project.completedAt && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Finalizat: {formatDate(project.completedAt)}</span>
                      </div>
                    )}
                    {project.size && (
                      <div className="flex items-center space-x-1">
                        <FileVideo className="w-3 h-3" />
                        <span>Dimensiune: {project.size}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {project.status === "completed" && (
                      <>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Eye className="w-3 h-3 mr-1" />
                          Vezi
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Download className="w-3 h-3 mr-1" />
                          Descarcă
                        </Button>
                      </>
                    )}
                    {project.status === "processing" && (
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                        <Clock className="w-3 h-3 mr-1" />
                        În procesare...
                      </Button>
                    )}
                    {project.status === "failed" && (
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Play className="w-3 h-3 mr-1" />
                        Reîncearcă
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <Card className="border-border shadow-sm">
            <CardContent className="p-12 text-center">
              <FileVideo className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nu s-au găsit proiecte</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                  ? "Încearcă să modifici filtrele de căutare."
                  : "Începe primul tău proiect de localizare."}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
