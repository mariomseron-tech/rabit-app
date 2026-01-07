import { BillatCalculator } from "../../components/BillatCalculator";
import { RabitChart } from "../../components/RabitChart";
import { TrainingZonesTable } from "../../components/TrainingZonesTable";

const chartData = Array.from({ length: 21 }, (_, index) => {
  const time = index * 30;
  return {
    time,
    speed: 10 + Math.sin(index / 2) * 3 + (index > 12 ? 1.5 : 0),
    hr: 130 + index * 2.5,
  };
});

const steps = [
  { start: 0, end: 180, label: "Warm-up" },
  { start: 180, end: 420, label: "AerT" },
  { start: 420, end: 600, label: "AnT" },
];

const metrics = [
  { label: "vVO2max", value: "16.8 km/h", context: "Speed ceiling" },
  { label: "AnT", value: "14.5 km/h", context: "Anaerobic threshold" },
  { label: "AerT", value: "12.0 km/h", context: "Aerobic threshold" },
  { label: "HR Max", value: "190 bpm", context: "Heart rate ceiling" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-600">Rabit Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Training Intensity Overview</h1>
          <p className="mt-2 text-base text-slate-500">
            Consolidated view of threshold markers, session performance, and interval guidance.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-400">{metric.context}</p>
            </div>
          ))}
        </section>

        <section>
          <RabitChart data={chartData} steps={steps} lastMinuteWindow={90} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <TrainingZonesTable vvo2max={16.8} hrMax={190} />
          <BillatCalculator vvo2max={16.8} />
        </section>
      </div>
    </div>
  );
}
