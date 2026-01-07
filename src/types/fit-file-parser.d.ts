declare module 'fit-file-parser' {
  export interface FitParserOptions {
    speedUnit?: 'km/h' | 'm/s';
    lengthUnit?: 'm' | 'km';
    force?: boolean;
  }

  export interface FitRecord {
    timestamp?: Date;
    position_lat?: number;
    position_long?: number;
    enhanced_speed?: number;
    speed?: number;
    heart_rate?: number;
    distance?: number;
    cadence?: number;
  }

  export interface FitData {
    records?: FitRecord[];
  }

  export default class FitParser {
    constructor(options?: FitParserOptions);
    parse(buffer: ArrayBuffer, callback: (error: Error | null, data: FitData) => void): void;
  }
}
