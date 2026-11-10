type Props = {
  current: number;
  total: number;
  accent?: string;
  label?: string;
};

export function ProgressBar({ current, total, accent = "#02043E", label }: Props) {
  const pct = Math.max(0, Math.min(100, (current / total) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="font-medium text-[#02043E]/70">
          {label ?? `Eje ${current} de ${total}`}
        </span>
        <span className="text-[#02043E]/45">
          {current}/{total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-sm bg-[#02043E]/10">
        <div
          className="h-full rounded-sm transition-all duration-300"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>
    </div>
  );
}
