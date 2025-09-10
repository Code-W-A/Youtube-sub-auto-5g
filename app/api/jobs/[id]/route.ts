import { NextResponse } from "next/server"
import { getJob } from "@/lib/jobs"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const preferredRegion = "iad1"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = getJob(params.id)
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  return NextResponse.json(job)
}


