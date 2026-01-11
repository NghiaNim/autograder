"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type StudentReport = {
  id: string;
  name: string;
  problems_completed: number;
  total_problems: number;
  total_score: number;
  max_score: number;
  submitted_at: string | null;
};

type ReportData = {
  assignment: { id: string; title: string; total_points: number };
  students: StudentReport[];
};

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shareCode, setShareCode] = useState("");

  async function fetchReport() {
    try {
      const res = await fetch(`/api/assignments/${id}/report`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setReport(data);

      const assignmentRes = await fetch(`/api/assignments/${id}`);
      const assignmentData = await assignmentRes.json();
      if (assignmentRes.ok) {
        setShareCode(assignmentData.share_code);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-surface-800/60">Loading report...</div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || "Report not found"}</p>
          <Link href="/teacher/assignments/new">
            <Button variant="secondary">Create New Assignment</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {report.assignment.title}
            </h1>
            <p className="text-surface-800/70 mt-1">
              {report.assignment.total_points} points per problem
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-surface-800/60">Share Code</div>
            <div className="font-mono text-2xl font-bold text-accent tracking-wider">
              {shareCode || "------"}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">Student Progress</h2>
            <Button variant="ghost" size="sm" onClick={fetchReport}>
              ↻ Refresh
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {report.students.length === 0 ? (
              <div className="px-6 py-12 text-center text-surface-800/60">
                No submissions yet. Share the code with students to get started.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">
                      Student
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">
                      Progress
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">
                      Score
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">
                      Last Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.students.map((student) => (
                    <tr key={student.id} className="border-b border-surface-50 last:border-0">
                      <td className="px-6 py-4 font-medium">{student.name}</td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            student.problems_completed === student.total_problems
                              ? "text-green-600"
                              : "text-surface-800/70"
                          }
                        >
                          {student.problems_completed}/{student.total_problems}
                          {student.problems_completed === student.total_problems && " ✓"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{student.total_score}</span>
                        <span className="text-surface-800/50">/{student.max_score}</span>
                      </td>
                      <td className="px-6 py-4 text-surface-800/60 text-sm">
                        {student.submitted_at
                          ? formatTime(student.submitted_at)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString();
}
