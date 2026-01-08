# RABIT Algorithm Notes

This document captures the current algorithm assumptions that the application will
implement. It is intended as a shared reference for implementation, tests, and
validation.

## Segmentation Tolerances

RABIT segments an activity into intervals based on pace and cadence changes.
Because FIT data can be noisy, segmentation uses tolerances rather than exact
comparisons:

- **Time tolerance:** Merge boundaries that are within ±2 seconds of a detected
  transition to avoid over-segmentation from jitter.
- **Distance tolerance:** Allow ±5 meters of drift when matching expected split
  distances (e.g., 400 m repeats).
- **Pace tolerance:** Treat pace changes as significant only when they exceed
  8–10% sustained over at least 5 seconds.
- **Cadence tolerance:** Treat cadence changes as significant only when they
  exceed 6–8% sustained over at least 5 seconds.

These tolerances are applied cumulatively: a segment boundary is finalized only
when at least two signals (pace/cadence/elapsed time) corroborate the change.

## Last-60s Logic

The “last-60s” window is used for end-of-interval evaluation and cooldown
classification:

1. For each candidate segment, compute the last 60 seconds of available samples.
2. If the segment duration is < 60 seconds, use the full segment as the window.
3. Compute summary statistics (mean pace, mean cadence, max acceleration) for
   the window.
4. Use the window metrics to decide whether the segment is:
   - **Work**: higher-than-baseline pace and/or cadence, and positive
     acceleration trend.
   - **Recovery**: lower-than-baseline pace and/or cadence, with flat or
     negative acceleration trend.

The last-60s window helps reduce false positives by focusing on the stabilized
portion of the segment instead of transition ramps.

## Acceleration Metric

Acceleration is derived from smoothed speed samples. The metric is defined as
an average of per-sample acceleration over a rolling 5-second window:

- Convert speed samples (m/s) into per-sample acceleration: `a_i = (v_i - v_{i-1}) / dt`.
- Smooth acceleration with a 5-second moving average to reduce spikes.
- For each segment, compute:
  - **Peak acceleration:** maximum smoothed value.
  - **Mean acceleration:** average smoothed value.
  - **Acceleration trend:** slope between the first and last 5-second windows.

Acceleration is used as a secondary signal for detecting interval starts and
fatigue, especially when pace or cadence is noisy.
