import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import Page from "../page";

const pushMock = vi.fn();
const parseFitFileMock = vi.fn();
const analyzeMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/fit/parseFitFile", () => ({
  parseFitFile: (...args: unknown[]) => parseFitFileMock(...args),
}));

vi.mock("@/lib/analysis/RabitAnalyzer", () => ({
  RabitAnalyzer: vi.fn().mockImplementation(() => ({
    analyze: (...args: unknown[]) => analyzeMock(...args),
  })),
}));

class FileReaderMock {
  result: ArrayBuffer | null = null;
  onload: ((this: FileReaderMock, ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((this: FileReaderMock, ev: ProgressEvent<FileReader>) => void) | null = null;

  readAsArrayBuffer() {
    this.result = new ArrayBuffer(8);
    if (this.onload) {
      this.onload.call(this, new ProgressEvent("load"));
    }
  }
}

describe("Upload page", () => {
  beforeEach(() => {
    parseFitFileMock.mockResolvedValue({ raw: new ArrayBuffer(8) });
    analyzeMock.mockResolvedValue({ summary: "Analysis complete", totalBytes: 8 });
    pushMock.mockClear();
    parseFitFileMock.mockClear();
    analyzeMock.mockClear();
    vi.stubGlobal("FileReader", FileReaderMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploads a file and routes to the dashboard", async () => {
    const user = userEvent.setup();
    render(<Page />);

    const input = screen.getByTestId("fit-file-input") as HTMLInputElement;
    const file = new File(["fit"], "ride.fit", { type: "application/octet-stream" });

    await user.upload(input, file);

    await waitFor(() => {
      expect(parseFitFileMock).toHaveBeenCalled();
      expect(analyzeMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });
});
