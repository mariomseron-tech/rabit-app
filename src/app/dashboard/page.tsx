"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  fileName?: string;
  analysis?: {
    summary?: string;
    totalBytes?: number;
  };
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("rabit-dashboard-data");
    if (stored) {
      try {
        setData(JSON.parse(stored) as DashboardData);
      } catch {
        setData(null);
      }
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <section className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold">Rabit Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          {data?.fileName ? `Analyzed: ${data.fileName}` : "No analysis available."}
        </p>
      </section>

      {data?.analysis ? (
        <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">Summary</h2>
          <p className="mt-2 text-sm text-slate-700">{data.analysis.summary}</p>
          <p className="mt-2 text-xs text-slate-500">
            Total bytes: {data.analysis.totalBytes}
          </p>
        </div>
      ) : (
        <div className="text-sm text-slate-600">
          <p>Upload a FIT file to see your analysis.</p>
          <Link className="mt-2 inline-flex text-sm text-blue-600 underline" href="/">
            Go to upload
          </Link>
        </div>
      )}
    </main>
  );
}
