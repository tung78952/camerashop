import { connection } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

type HealthResponse = {
  status: string;
};

async function getBackendStatus(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) {
      return `lỗi HTTP ${res.status}`;
    }
    const data: HealthResponse = await res.json();
    return data.status;
  } catch {
    return "không kết nối được";
  }
}

export default async function Home() {
  await connection();
  const status = await getBackendStatus();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">CameraShop</h1>
      <p className="text-lg">
        Backend: <span className="font-mono">{status}</span>
      </p>
    </main>
  );
}
