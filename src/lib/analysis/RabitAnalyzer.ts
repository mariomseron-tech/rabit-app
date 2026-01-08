import type { FitFileData } from "@/lib/fit/parseFitFile";

export type RabitAnalysis = {
  summary: string;
  totalBytes: number;
};

export class RabitAnalyzer {
  constructor(private readonly fitFile: FitFileData) {}

  async analyze(): Promise<RabitAnalysis> {
    return {
      summary: "Analysis complete",
      totalBytes: this.fitFile.raw.byteLength,
    };
  }
}
