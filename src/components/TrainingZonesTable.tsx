import { calculateTrainingZones, formatRange } from "../lib/trainingZones";

export type TrainingZonesTableProps = {
  vvo2max: number;
  hrMax: number;
};

export const TrainingZonesTable = ({ vvo2max, hrMax }: TrainingZonesTableProps) => {
  const zones = calculateTrainingZones({ vvo2max, hrMax });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Training Zones</h3>
        <p className="text-sm text-slate-500">Derived from vVO2max and HR max.</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-2 font-medium">Zone</th>
              <th className="px-4 py-2 font-medium">Speed (km/h)</th>
              <th className="px-4 py-2 font-medium">HR (bpm)</th>
              <th className="px-4 py-2 font-medium">Focus</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.name} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium text-slate-900">{zone.name}</td>
                <td className="px-4 py-2 text-slate-600">{formatRange(zone.speedRange)}</td>
                <td className="px-4 py-2 text-slate-600">{formatRange(zone.hrRange, 0)}</td>
                <td className="px-4 py-2 text-slate-500">{zone.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
