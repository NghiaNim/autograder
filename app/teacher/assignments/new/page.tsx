"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Criterion } from "@/lib/schemas/rubric.schema";

const DEMO_TEACHER_ID = "00000000-0000-0000-0000-000000000001";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rubric, setRubric] = useState<{ criteria: Criterion[]; total_points: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!title.trim() || !description.trim()) {
      setError("Title and description required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          teacher_id: DEMO_TEACHER_ID,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create assignment");
      }

      router.push(`/teacher/assignments/${data.id}/report`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create Assignment</h1>
          <p className="text-surface-800/70 mt-1">
            Enter details and we'll generate a rubric automatically
          </p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Assignment Title"
              placeholder="e.g., Solve quadratic equations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Textarea
              id="description"
              label="Description"
              placeholder="Describe what students should do..."
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              onClick={handleGenerate}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Creating & Generating Rubric..." : "Create Assignment"}
            </Button>
          </CardContent>
        </Card>

        {rubric && (
          <Card>
            <CardHeader>
              <h2 className="font-semibold">Generated Rubric</h2>
              <p className="text-sm text-surface-800/60">
                Total: {rubric.total_points} points
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {rubric.criteria.map((c, i) => (
                <div key={i} className="p-3 bg-surface-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{c.name}</h3>
                      <p className="text-sm text-surface-800/60">{c.description}</p>
                    </div>
                    <span className="text-sm font-medium text-accent">
                      {c.points} pts
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
