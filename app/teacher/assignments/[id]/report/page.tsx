"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

type Problem = {
  question: string;
  hint: string | null;
};

type Criterion = {
  name: string;
  description: string;
  points: number;
  levels: { name: string; description: string; percentage: number }[];
};

type Rubric = {
  criteria: Criterion[];
  problems: Problem[];
  total_points: number;
};

type AssignmentData = {
  id: string;
  title: string;
  description: string;
  share_code: string;
  rubric: Rubric;
};

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

type Tab = "students" | "problems" | "rubric";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("students");
  const [editingProblem, setEditingProblem] = useState<number | null>(null);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    try {
      const [assignmentRes, reportRes] = await Promise.all([
        fetch(`/api/assignments/${id}`),
        fetch(`/api/assignments/${id}/report`),
      ]);

      const assignmentData = await assignmentRes.json();
      const reportData = await reportRes.json();

      if (!assignmentRes.ok) throw new Error(assignmentData.error);
      if (!reportRes.ok) throw new Error(reportData.error);

      setAssignment(assignmentData);
      setReport(reportData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [id]);

  function startEditProblem(index: number) {
    setEditingProblem(index);
    setEditedQuestion(assignment?.rubric.problems[index]?.question || "");
  }

  async function saveProblem(index: number) {
    if (!assignment) return;
    setSaving(true);

    const updatedProblems = [...assignment.rubric.problems];
    updatedProblems[index] = { ...updatedProblems[index], question: editedQuestion };

    try {
      const res = await fetch(`/api/assignments/${id}/rubric`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          criteria: assignment.rubric.criteria,
          problems: updatedProblems,
          total_points: assignment.rubric.total_points,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setAssignment({
        ...assignment,
        rubric: { ...assignment.rubric, problems: updatedProblems },
      });
      setEditingProblem(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-surface-800/60">Loading...</div>
      </main>
    );
  }

  if (error || !assignment || !report) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || "Not found"}</p>
          <Link href="/teacher/assignments/new">
            <Button variant="secondary">Create New Assignment</Button>
          </Link>
        </div>
      </main>
    );
  }

  const problems = assignment.rubric?.problems || [];
  const criteria = assignment.rubric?.criteria || [];

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-surface-900">
              {assignment.title}
            </h1>
            <p className="text-surface-800/70 mt-1">
              {assignment.rubric.total_points} points per problem · {problems.length} problems
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-surface-800/60">Share Code</div>
            <div className="font-mono text-2xl font-bold text-accent tracking-wider">
              {assignment.share_code}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-surface-200">
          {(["students", "problems", "rubric"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-accent text-accent"
                  : "border-transparent text-surface-800/60 hover:text-surface-800"
              }`}
            >
              {tab === "students" && `Students (${report.students.length})`}
              {tab === "problems" && `Problems (${problems.length})`}
              {tab === "rubric" && `Rubric (${criteria.length})`}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === "students" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="font-semibold">Student Progress</h2>
              <Button variant="ghost" size="sm" onClick={fetchData}>
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
                      <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">Student</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">Progress</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">Score</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-surface-800/60">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.students.map((student) => (
                      <tr key={student.id} className="border-b border-surface-50 last:border-0">
                        <td className="px-6 py-4 font-medium">{student.name}</td>
                        <td className="px-6 py-4">
                          <span className={student.problems_completed === student.total_problems ? "text-green-600" : "text-surface-800/70"}>
                            {student.problems_completed}/{student.total_problems}
                            {student.problems_completed === student.total_problems && " ✓"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium">{student.total_score}</span>
                          <span className="text-surface-800/50">/{student.max_score}</span>
                        </td>
                        <td className="px-6 py-4 text-surface-800/60 text-sm">
                          {student.submitted_at ? formatTime(student.submitted_at) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div className="space-y-4">
            {problems.map((problem, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="font-medium">Problem {i + 1}</h3>
                  {editingProblem !== i && (
                    <Button variant="ghost" size="sm" onClick={() => startEditProblem(i)}>
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {editingProblem === i ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editedQuestion}
                        onChange={(e) => setEditedQuestion(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveProblem(i)} loading={saving}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingProblem(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-surface-800 whitespace-pre-wrap">{problem.question}</p>
                  )}
                  {problem.hint && (
                    <p className="text-sm text-surface-800/60 mt-2 italic">Hint: {problem.hint}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rubric Tab */}
        {activeTab === "rubric" && (
          <div className="space-y-4">
            <div className="text-sm text-surface-800/60">
              Total: {assignment.rubric.total_points} points per problem
            </div>
            {criteria.map((criterion, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{criterion.name}</h3>
                      <p className="text-sm text-surface-800/60">{criterion.description}</p>
                    </div>
                    <span className="text-accent font-medium">{criterion.points} pts</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {criterion.levels.map((level, j) => (
                      <div key={j} className="p-2 bg-surface-50 rounded">
                        <div className="font-medium text-surface-800">{level.name}</div>
                        <div className="text-surface-800/60 text-xs mt-1">{level.description}</div>
                        <div className="text-accent text-xs mt-1">{level.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
