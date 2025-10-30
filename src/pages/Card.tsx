import StampCard from "../components/StampCard";

export default function Card() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-left space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">スタンプカード</h1>
          <a href="/" className="text-sm text-blue-600 hover:underline">ホーム</a>
        </div>
        <StampCard />
      </div>
    </div>
  );
}


