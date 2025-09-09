import { NextResponse } from "next/server"
import { getJob, listArtifacts } from "@/lib/jobs"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id)
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const list = listArtifacts(params.id)
  return NextResponse.json(list)
}


