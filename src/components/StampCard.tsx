import { useEffect, useMemo, useState } from "react";

type StampCardProps = {
  userName?: string | null;
  total?: number; // 目標スタンプ数（デフォルト10）
};

const STORAGE_KEY = "stampcard:stamps";

export default function StampCard({ userName, total = 10 }: StampCardProps) {
  const [stamps, setStamps] = useState<number>(0);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY) || 0);
      if (!Number.isNaN(saved)) setStamps(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(stamps));
    } catch {}
  }, [stamps]);

  const clampedTotal = Math.max(1, total);
  const progress = useMemo(() => Math.min(stamps, clampedTotal), [stamps, clampedTotal]);
  const percent = Math.round((progress / clampedTotal) * 100);

  const handleAdd = () => setStamps((s) => Math.min(s + 1, clampedTotal));
  const handleReset = () => setStamps(0);

  const cells = Array.from({ length: clampedTotal });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">スタンプカード</h2>
        {userName && <p className="text-sm text-gray-600">{userName} さん</p>}
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-green-500"
          style={{ width: `${percent}%` }}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <p className="text-sm text-gray-700">{progress} / {clampedTotal}（{percent}%）</p>

      <div className="grid grid-cols-5 gap-3">
        {cells.map((_, idx) => {
          const filled = idx < progress;
          return (
            <div
              key={idx}
              className={
                "aspect-square rounded-full flex items-center justify-center border " +
                (filled
                  ? "bg-yellow-400 border-yellow-500 text-yellow-900"
                  : "bg-white border-gray-300 text-gray-400")
              }
            >
              {filled ? "★" : String(idx + 1)}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          className="flex-1 py-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          スタンプを追加
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium"
        >
          リセット
        </button>
      </div>
    </div>
  );
}


