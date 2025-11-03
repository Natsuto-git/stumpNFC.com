export function Progress({ value = 0, className = '' }: { value?: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={`w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
      <div className="h-full bg-amber-300" style={{ width: `${pct}%`, height: '100%' }} />
    </div>
  );
}

export default Progress;


