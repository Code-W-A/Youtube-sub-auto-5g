import { NextResponse } from "next/server"
import JSZip from "jszip"
import { getArtifactContent, getJob, listArtifacts, slugify } from "@/lib/jobs"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const zip = new JSZip()
  const root = slugify(job.title || `job_${job.id}`)

  const subsFolder = zip.folder(`${root}/Subtitrari`)
  const titlesFolder = zip.folder(`${root}/Titluri_Descrieri`)

  const artifacts = listArtifacts(job.id)
  for (const a of artifacts) {
    const res = getArtifactContent(a.id)
    if (!res) continue
    const { artifact, content } = res
    if (artifact.type === "subtitle-srt" || artifact.type === "subtitle-vtt") {
      subsFolder?.file(artifact.filename, content)
    }
    if (artifact.type === "titles-descriptions") {
      titlesFolder?.file(artifact.filename, content)
    }
  }

  const blob = await zip.generateAsync({ type: "uint8array" })
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${root}.zip"`,
    },
  })
}


