import { TrainingZone } from '../types/rabit';

interface TrainingZonesTableProps {
  zones: TrainingZone[];
}

function formatRange(range: [number | null, number | null], unit: string) {
  const [min, max] = range;
  if (min === null && max === null) {
    return 'N/A';
  }
  if (max === null) {
    return `> ${min?.toFixed(1)} ${unit}`;
  }
  return `${min?.toFixed(1)} - ${max.toFixed(1)} ${unit}`;
}

export function TrainingZonesTable({ zones }: TrainingZonesTableProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Zone</th>
          <th>Description</th>
          <th>Speed</th>
          <th>Heart Rate</th>
        </tr>
      </thead>
      <tbody>
        {zones.map((zone) => (
          <tr key={zone.name}>
            <td>{zone.name}</td>
            <td>{zone.description}</td>
            <td>{formatRange(zone.speedRange, 'km/h')}</td>
            <td>{formatRange(zone.heartRateRange, 'bpm')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
