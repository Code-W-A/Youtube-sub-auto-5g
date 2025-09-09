import { NextResponse } from "next/server"
import { getArtifactContent } from "@/lib/jobs"

export async function GET(_: Request, { params }: { params: { artifactId: string } }) {
  const result = getArtifactContent(params.artifactId)
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const { artifact, content } = result
  return new NextResponse(content, {
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Disposition": `attachment; filename="${artifact.filename}"`,
    },
  })
}


