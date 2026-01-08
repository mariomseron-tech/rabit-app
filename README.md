# rabit-app

Rabit Digital App focuses on the RABIT protocol for analyzing run workouts from
FIT files.

## Setup

1. Clone the repository.
2. Ensure you have the tooling required for the eventual parser/runtime
   (language/runtime selection is pending).
3. Use the sample FIT files in `samples/` to validate parsing and segmentation
   once the implementation is in place.

## Scripts

The project is currently pre-implementation, so scripts are not yet wired up.
Planned scripts are listed below for reference:

| Script | Purpose | Command |
| --- | --- | --- |
| format | Format code and docs | `TBD` |
| lint | Run static analysis | `TBD` |
| test | Execute unit + fixture tests | `TBD` |

## Data Flow

1. **Ingest**: Load a FIT file from disk.
2. **Normalize**: Convert samples to a unified time series (time, distance,
   pace, cadence, heart rate).
3. **Segment**: Apply RABIT segmentation tolerances to find work/recovery blocks.
4. **Evaluate**: Use last-60s logic and acceleration metrics to classify
   segments.
5. **Report**: Export interval summaries and protocol compliance insights.

## RABIT Protocol Summary

RABIT (Run Analysis Based on Interval Tolerances) focuses on:

- **Structured intervals**: Work and recovery segments identified from pacing
  and cadence patterns.
- **Tolerance-driven segmentation**: Boundaries are resilient to sensor noise
  and GPS drift.
- **Last-60s evaluation**: Each segment is scored using a final 60-second window
  to reflect stabilized effort.
- **Acceleration context**: Acceleration trends provide additional insight into
  effort changes and fatigue.

For detailed algorithm notes, see `docs/algorithm.md`.

## Sample FIT Files

Sanitized sample FIT files are located in `samples/`:

- `samples/sanitized_easy_run.fit`
- `samples/sanitized_intervals.fit`

These files are text-only placeholders meant to avoid binary artifacts in the
repo while still exercising parsing and segmentation logic. The test harness
should treat them as fixture inputs and can convert them to real FIT binaries
later if needed.

## Tests

Once the test harness is implemented, use the sample FIT files to validate
parsing and segmentation. Example test flow (to be wired up later):

1. Parse both sample FIT files.
2. Assert the normalized time series fields exist.
3. Verify segmentation output matches expected interval counts.
4. Validate last-60s and acceleration metrics against stored fixtures.
