"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoin() {
    if (code.length !== 6) {
      setError("Enter a 6-character code");
      return;
    }
    if (!name.trim()) {
      setError("Enter your name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const lookupRes = await fetch(`/api/assignments/lookup?code=${code.toUpperCase()}`);
      const lookupData = await lookupRes.json();

      if (!lookupRes.ok) {
        throw new Error(lookupData.error || "Assignment not found");
      }

      const studentRes = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const studentData = await studentRes.json();

      if (!studentRes.ok) {
        throw new Error(studentData.error || "Failed to register");
      }

      localStorage.setItem("student_id", studentData.id);
      localStorage.setItem("student_name", studentData.name);

      router.push(`/student/assignments/${lookupData.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-surface-900">Join Assignment</h1>
          <p className="text-surface-800/70 mt-1">Enter the code from your teacher</p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            <Input
              id="name"
              label="Your Name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-800">
                Assignment Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.3em] uppercase bg-white text-surface-900 border border-surface-200 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent placeholder:text-surface-800/50"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              onClick={handleJoin}
              loading={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Joining..." : "Start Assignment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
