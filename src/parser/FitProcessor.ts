import FitParser, { FitRecord } from 'fit-file-parser';

import { DataPoint, FitData } from '../types/rabit';

const SEMICIRCLE_TO_DEGREES = 180 / 2 ** 31;

function toDegrees(value?: number): number | null {
  if (value === undefined) {
    return null;
  }
  return value * SEMICIRCLE_TO_DEGREES;
}

function getSpeed(record: FitRecord): number {
  if (record.enhanced_speed !== undefined) {
    return record.enhanced_speed;
  }

  return record.speed ?? 0;
}

function normalizeRecords(records: FitRecord[]): DataPoint[] {
  const startTime = records.find((record) => record.timestamp)?.timestamp;

  return records
    .filter((record): record is FitRecord & { timestamp: Date } => record.timestamp instanceof Date)
    .map((record) => {
      const elapsed = startTime
        ? Math.max(0, (record.timestamp.getTime() - startTime.getTime()) / 1000)
        : 0;

      return {
        timestamp: record.timestamp,
        elapsed_s: elapsed,
        lat: toDegrees(record.position_lat),
        lon: toDegrees(record.position_long),
        speed: getSpeed(record),
        heartRate: record.heart_rate ?? null,
        distance: record.distance ?? null,
        cadence: record.cadence ?? null,
        isRest: false,
      };
    });
}

export function parseFitFile(buffer: ArrayBuffer): Promise<FitData> {
  const parser = new FitParser({
    speedUnit: 'km/h',
    lengthUnit: 'm',
    force: true,
  });

  return new Promise<FitData>((resolve, reject) => {
    parser.parse(buffer, (error, data) => {
      if (error) {
        reject(error);
        return;
      }

      const records = data.records ?? [];
      resolve({
        records: normalizeRecords(records),
      });
    });
  });
}
