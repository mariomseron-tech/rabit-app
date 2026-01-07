export type FitFileData = {
  raw: ArrayBuffer;
};

export async function parseFitFile(data: ArrayBuffer): Promise<FitFileData> {
  return { raw: data };
}
