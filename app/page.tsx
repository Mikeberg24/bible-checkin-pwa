export const runtime = "nodejs";

"use client";

import { useEffect, useState } from "react";

type Status = {
  mikey: boolean;
  lee: boolean;
};

export default function Page() {
  const [code, setCode] = useState("");
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    if (!code) return;
    setLoading(true);
    const res = await fetch(
      `/api/today?day=${date}&code=${code}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    setStatus(data);
    setLoading(false);
  }

  async function markDone(person: "mikey" | "lee") {
    if (!code) return;
    await fetch("/api/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        day: date,
        code,
        person,
      }),
    });
    loadStatus();
  }

  useEffect(() => {
    if (code) loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <main style={styles.main}>
      <h1 style={styles.title}>
        Bible Check-in <span>✅</span>
      </h1>

      <p style={styles.subtitle}>
        Track daily reading for <b>Mikey</b> and <b>Lee Lee</b>.
      </p>

      <div style={styles.controls}>
        <div>
          <label>Couple code</label>
          <input
            style={styles.input}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
          />
        </div>

        <div>
          <label>Day</label>
          <input
            style={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <button onClick={loadStatus} style={styles.refresh}>
        Refresh
      </button>

      {loading && <p>Loading…</p>}

      {status && (
        <div style={styles.cards}>
          <PersonCard
            name="Mikey"
            done={status.mikey}
            onClick={() => markDone("mikey")}
          />
          <PersonCard
            name="Lee Lee"
            done={status.lee}
            onClick={() => markDone("lee")}
          />
        </div>
      )}

      <p style={styles.tip}>
        Tip: enter the code once, then change the date to check past days.
      </p>
    </main>
  );
}

function PersonCard({
  name,
  done,
  onClick,
}: {
  name: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <div style={styles.card}>
      <h2>{name}</h2>
      <p>
        Status:{" "}
        <b style={{ color: done ? "green" : "crimson" }}>
          {done ? "Done ✅" : "Not yet ❌"}
        </b>
      </p>
      <button onClick={onClick} style={styles.button}>
        Mark done
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: 700,
    margin: "40px auto",
    padding: 20,
    fontFamily: "serif",
    textAlign: "center",
  },
  title: {
    fontSize: 40,
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 30,
  },
  controls: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    marginBottom: 20,
  },
  input: {
    display: "block",
    padding: 8,
    marginTop: 6,
    fontSize: 16,
  },
  refresh: {
    padding: "8px 16px",
    marginBottom: 30,
  },
  cards: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: 20,
    width: 250,
  },
  button: {
    marginTop: 10,
    padding: "6px 12px",
  },
  tip: {
    marginTop: 30,
    fontSize: 14,
    opacity: 0.7,
  },
};
