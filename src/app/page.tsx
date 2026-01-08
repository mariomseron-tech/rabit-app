import Link from "next/link";

const features = [
  {
    title: "Modern Stack",
    description: "App Router, TypeScript, ESLint, Prettier, and Vitest configured from day one."
  },
  {
    title: "Developer Experience",
    description: "Pre-commit hooks keep quality high with linting and formatting checks."
  },
  {
    title: "Testing Ready",
    description: "React Testing Library and Vitest provide fast, reliable feedback loops."
  }
];

export default function HomePage() {
  return (
    <main className="hero">
      <h1>Welcome to Rabit Digital</h1>
      <p>
        Start building with the Next.js App Router foundation. Strict TypeScript settings and a
        curated toolchain keep the codebase clean, consistent, and easy to maintain.
      </p>
      <Link className="cta" href="https://nextjs.org/docs/app">
        Explore the App Router docs →
      </Link>
      <section className="grid" aria-label="Feature highlights">
        {features.map((feature) => (
          <article className="card" key={feature.title}>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
"use client";

import type React from "react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { parseFitFile } from "@/lib/fit/parseFitFile";
import { RabitAnalyzer } from "@/lib/analysis/RabitAnalyzer";

type UploadStatus = "idle" | "reading" | "parsing" | "analyzing" | "done" | "error";

export default function Page() {
  const router = useRouter();
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      setFileName(file.name);
      setStatus("reading");

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          setStatus("parsing");
          const arrayBuffer = reader.result as ArrayBuffer;
          const parsed = await parseFitFile(arrayBuffer);

          setStatus("analyzing");
          const analyzer = new RabitAnalyzer(parsed);
          const analysis = await analyzer.analyze();
          sessionStorage.setItem(
            "rabit-dashboard-data",
            JSON.stringify({ parsed, analysis, fileName: file.name })
          );
          setStatus("done");
          router.push("/dashboard");
        } catch (caught) {
          setError(caught instanceof Error ? caught.message : "Unable to parse file.");
          setStatus("error");
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setStatus("error");
      };

      reader.readAsArrayBuffer(file);
    },
    [router]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <section className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">Upload your FIT file</h1>
        <p className="mt-2 text-sm text-slate-600">
          Drag and drop a .fit file or choose one to parse and analyze.
        </p>
      </section>

      <div
        className="flex w-full max-w-xl flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-slate-300 p-10 text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p className="text-sm text-slate-600">Drop file here</p>
        <label className="cursor-pointer rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Choose file
          <input
            className="hidden"
            data-testid="fit-file-input"
            type="file"
            accept=".fit"
            onChange={handleInputChange}
          />
        </label>
        {fileName && <p className="text-xs text-slate-500">Selected: {fileName}</p>}
      </div>

      <section className="text-center text-sm text-slate-700">
        {status === "idle" && <p>Waiting for a file to begin.</p>}
        {status === "reading" && <p>Reading file...</p>}
        {status === "parsing" && <p>Parsing FIT data...</p>}
        {status === "analyzing" && <p>Analyzing ride metrics...</p>}
        {status === "done" && <p>Analysis complete. Redirecting...</p>}
        {status === "error" && <p className="text-red-600">{error}</p>}
      </section>
    </main>
  );
}
