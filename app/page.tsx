"use client";

import { useEffect, useState } from "react";

type Status = {
  mikey: boolean;
  lee: boolean;
};

export default function Page() {
  const [code, setCode] = useState("");
  const [date, setDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<Status | null>(null);

  async function loadStatus() {
    if (!code) return;
    const res = await fetch(`/api/today?day=${date}&code=${code}`, {
      cache: "no-store",
    });
    setStatus(await res.json());
  }

  async function markDone(person: "mikey" | "lee") {
    await fetch("/api/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: date, code, person }),
    });
    loadStatus();
  }

  useEffect(() => {
    if (code) loadStatus();
  }, [date]);

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h1>Bible Check-in ✅</h1>
      <p>Track daily reading for <b>Mikey</b> and <b>Lee Lee</b>.</p>

      <input
        placeholder="Couple code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {status && (
        <>
          <div>
            Mikey: {status.mikey ? "✅" : "❌"}
            <button onClick={() => markDone("mikey")}>Mark</button>
          </div>
          <div>
            Lee Lee: {status.lee ? "✅" : "❌"}
            <button onClick={() => markDone("lee")}>Mark</button>
          </div>
        </>
      )}
    </main>
  );
}
