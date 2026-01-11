import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-surface-900">
            Goblins Auto-Grader
          </h1>
          <p className="text-surface-800/70">
            AI-powered assignment grading for teachers
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <Link
            href="/teacher/assignments/new"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-colors"
          >
            Create Assignment
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-surface-200 text-surface-800 font-medium rounded-lg hover:bg-surface-100 transition-colors"
          >
            Join as Student
          </Link>
        </div>
      </div>
    </main>
  );
}
