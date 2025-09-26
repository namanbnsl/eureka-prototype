import { jobStore } from "@/lib/job-store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const job = jobStore.get(params.id);
  if (!job) {
    return new Response(JSON.stringify({ error: "Job not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify(job), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
