"use client";

import { useEffect, useMemo, useState } from "react";

type Status = {
  day: string;
  mikey: boolean;
  leelee: boolean;
};

function formatLocalYYYYMMDD(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function Home() {
  const [day, setDay] = useState<string>(() => formatLocalYYYYMMDD(new Date()));
  const [code, setCode] = useState<string>("");
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canFetch = useMemo(() => day.length === 10 && code.length > 0, [day, code]);

  async function load() {
    if (!canFetch) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/today?day=${encodeURIComponent(day)}&code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
      const data = (await res.json()) as Status;
      setStatus(data);
    } catch (e: any) {
      setStatus(null);
      setErr(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(person: "mikey" | "leelee") {
    if (!canFetch) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, person, code }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Failed (${res.status})`);
      }
      const data = (await res.json()) as Status;
      setStatus(data);
    } catch (e: any) {
      setErr(e?.message ?? "Toggle failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Auto-load once code is entered
    if (canFetch) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day, code]);

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 20, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 28, marginBottom: 10 }}>Bible Check-In</h1>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        Pick a day, enter the shared code, and toggle check-ins.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Day</span>
          <input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            type="date"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Shared Code</span>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter code"
            style={{ padding: 10, borderRadius: 10, border: "1px solid #ddd" }}
          />
        </label>

        <button
          onClick={load}
          disabled={!canFetch || loading}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: !canFetch || loading ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>

        {err && (
          <div style={{ padding: 12, borderRadius: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
            <b>Error:</b> {err}
          </div>
        )}

        {status && (
          <div style={{ padding: 14, borderRadius: 14, border: "1px solid #e6e6e6" }}>
            <div style={{ display: "grid", gap: 10 }}>
              <Row name="Mikey" value={status.mikey} onToggle={() => toggle("mikey")} disabled={loading} />
              <Row name="Lee Lee" value={status.leelee} onToggle={() => toggle("leelee")} disabled={loading} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Row({
  name,
  value,
  onToggle,
  disabled,
}: {
  name: string;
  value: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 18 }}>
        <b>{name}:</b> {value ? "✅" : "❌"}
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        style={{
          padding: "10px 14px",
          borderRadius: 12,
          border: "1px solid #ddd",
          cursor: disabled ? "not-allowed" : "pointer",
          fontWeight: 700,
        }}
      >
        Toggle
      </button>
    </div>
  );
}
