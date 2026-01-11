"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Whiteboard } from "@/components/Whiteboard";

type Problem = {
  question: string;
  hint?: string;
};

type AssignmentData = {
  id: string;
  title: string;
  description: string;
  rubric: {
    total_points: number;
    problems: Problem[];
  };
};

type ScoreResult = {
  points_earned: number;
  total_points: number;
};

export default function StudentAssignmentPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentProblem, setCurrentProblem] = useState(0);
  const [scores, setScores] = useState<ScoreResult[]>([]);
  const [showScore, setShowScore] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  const problems = assignment?.rubric?.problems || [];
  const totalProblems = problems.length || 5;
  const currentQuestion = problems[currentProblem]?.question || assignment?.description || "";

  useEffect(() => {
    const storedId = localStorage.getItem("student_id");
    if (!storedId) {
      router.push("/join");
      return;
    }
    setStudentId(storedId);

    async function fetchAssignment() {
      try {
        const res = await fetch(`/api/assignments/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAssignment(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignment();
  }, [id, router]);

  async function handleSubmit(imageDataUrl: string) {
    if (!studentId || !assignment) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment_id: id,
          student_id: studentId,
          problem_index: currentProblem,
          whiteboard_data: {
            strokes: [],
            image_url: imageDataUrl,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScores((prev) => [...prev, data.score]);
      setShowScore(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleNext() {
    if (currentProblem < totalProblems - 1) {
      setCurrentProblem((prev) => prev + 1);
      setShowScore(false);
    }
  }

  const isComplete = currentProblem === totalProblems - 1 && showScore;
  const totalEarned = scores.reduce((sum, s) => sum + s.points_earned, 0);
  const totalMax = scores.reduce((sum, s) => sum + s.total_points, 0);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-surface-800/60">Loading...</div>
      </main>
    );
  }

  if (error && !assignment) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button variant="secondary" onClick={() => router.push("/join")}>
            Go Back
          </Button>
        </div>
      </main>
    );
  }

  if (isComplete) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h1 className="text-2xl font-bold">Assignment Complete!</h1>
            <div className="text-4xl font-bold text-accent">
              {totalEarned}/{totalMax}
            </div>
            <p className="text-surface-800/60">
              {totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0}% score
            </p>
            <Button variant="secondary" onClick={() => router.push("/")}>
              Done
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-900">
              {assignment?.title}
            </h1>
            <p className="text-sm text-surface-800/60">
              Problem {currentProblem + 1} of {totalProblems}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalProblems }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < scores.length
                    ? "bg-green-500"
                    : i === currentProblem
                    ? "bg-accent"
                    : "bg-surface-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-800">
          ⚠️ AI feedback is disabled for this assignment
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-medium">Problem {currentProblem + 1}</h2>
          </CardHeader>
          <CardContent>
            <p className="text-surface-800 whitespace-pre-wrap">{currentQuestion}</p>
            {problems[currentProblem]?.hint && (
              <p className="text-sm text-surface-800/60 mt-2 italic">
                Hint: {problems[currentProblem].hint}
              </p>
            )}
          </CardContent>
        </Card>

        {showScore ? (
          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <div className="text-3xl font-bold">
                <span className="text-accent">
                  {scores[scores.length - 1]?.points_earned}
                </span>
                <span className="text-surface-800/50">
                  /{scores[scores.length - 1]?.total_points}
                </span>
              </div>
              <p className="text-surface-800/60">Points earned for this problem</p>
              {currentProblem < totalProblems - 1 && (
                <Button onClick={handleNext}>Next Problem →</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <Whiteboard onExport={handleSubmit} disabled={submitting} />
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            {submitting && (
              <div className="text-center py-4 text-surface-800/60">
                <span className="animate-pulse">Grading your work...</span>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
