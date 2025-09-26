// Simple in-memory job store. Lives in memory of the server process only.
// NOTE: This will reset on server restarts or hot reloads.

import { randomUUID } from "crypto";

export type JobStatus = "generating" | "ready" | "error";

export interface VideoJob {
  id: string;
  description: string;
  status: JobStatus;
  videoUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

class InMemoryJobStore {
  private jobs = new Map<string, VideoJob>();

  create(description: string): VideoJob {
    const id = randomUUID();
    const now = new Date().toISOString();
    const job: VideoJob = {
      id,
      description,
      status: "generating",
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(id, job);
    return job;
  }

  get(id: string): VideoJob | undefined {
    return this.jobs.get(id);
  }

  setReady(id: string, videoUrl: string): VideoJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    job.status = "ready";
    job.videoUrl = videoUrl;
    job.updatedAt = new Date().toISOString();
    this.jobs.set(id, job);
    return job;
  }

  setError(id: string, message: string): VideoJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    job.status = "error";
    job.error = message;
    job.updatedAt = new Date().toISOString();
    this.jobs.set(id, job);
    return job;
  }
}

export const jobStore = new InMemoryJobStore();
