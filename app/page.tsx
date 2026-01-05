"use client";

import { useEffect, useState } from "react";

type Status = {
  mikey: boolean;
  lee: boolean;
};

export default function HomePage() {
  const [code, setCode] = useState("");
  const [day, setDay] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    if (!code || !day) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/today?day=${day}&code=${code}`
      );
      if (!res.ok) {
        setStatus(null);
        return;
      }
      const data = await res.json();
      setStatus({
        mikey: data.mikey_done,
        lee: data.gf_done,
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggle(person: "mikey" | "lee") {
    if (!code || !day) return;

    await fetch("/api/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, code, person }),
    });

    loadStatus();
  }

  useEffect(() => {
    loadStatus();
  }, [day]);

  return (
    <main style={{ maxWidth: 600, margin: "40px auto", fontFamily: "serif" }}>
      <h1>
        Bible Check-in ✅
      </h1>

      <p>Track daily reading for <b>Mikey</b> and <b>Lee Lee</b>.</p>

      <div style={{ marginBottom: 16 }}>
        <label>
          Couple code<br />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </label>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>
          Day<br />
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={{ padding: 8 }}
          />
        </label>
      </div>

      <button onClick={loadStatus} disabled={loading}>
        Refresh
      </button>

      {status && (
        <>
          <div style={{ marginTop: 24, padding: 16, border: "1px solid #ccc" }}>
            <h3>Mikey</h3>
            <p>Status: {status.mikey ? "Done ✅" : "Not yet ❌"}</p>
            <button onClick={() => toggle("mikey")}>
              Mark done
            </button>
          </div>

          <div style={{ marginTop: 16, padding: 16, border: "1px solid #ccc" }}>
            <h3>Lee Lee</h3>
            <p>Status: {status.lee ? "Done ✅" : "Not yet ❌"}</p>
            <button onClick={() => toggle("lee")}>
              Mark done
            </button>
          </div>
        </>
      )}

      <p style={{ marginTop: 24, color: "#666" }}>
        Tip: enter the code once, then you can change dates to view past days.
      </p>
    </main>
  );
}
