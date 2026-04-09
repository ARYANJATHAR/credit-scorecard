export default function ScoreMeter({ score }) {
  const percentage = Math.max(0, Math.min(100, score));

  let barColor = 'bg-accent';
  let textColor = 'text-accent';
  if (score >= 60) {
    barColor = 'bg-primary';
    textColor = 'text-primary';
  } else if (score >= 41) {
    barColor = 'bg-ink/35';
    textColor = 'text-ink';
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-2">
        <span className="text-sm font-medium text-ink/80">Credit Score</span>
        <span className={`text-3xl font-bold ${textColor}`}>
          {score}<span className="text-lg text-ink/35">/100</span>
        </span>
      </div>
      <div className="w-full h-4 bg-primary/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-ink/40">
        <span>0</span>
        <span>40</span>
        <span>60</span>
        <span>100</span>
      </div>
    </div>
  );
}
