"use client";

import { useEffect, useMemo, useState } from "react";

type TodayResponse = {
  day?: string;
  mike_done?: boolean | null;
  gf_done?: boolean | null;
  updated_at?: string | null;
  error?: string;
};

function formatDay(d: Date) {
  // YYYY-MM-DD in local time
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function HomePage() {
  const [code, setCode] = useState("");
  const [day, setDay] = useState(() => formatDay(new Date()));
  const [data, setData] = useState<TodayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyWho, setBusyWho] = useState<null | "mike" | "gf">(null);
  const [msg, setMsg] = useState<string>("");

  const niceDay = useMemo(() => {
    try {
      const [y, m, d] = day.split("-").map(Number);
      const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
      return dt.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return day;
    }
  }, [day]);

  async function fetchToday() {
    setMsg("");
    if (!code) {
      setMsg("Enter the couple code first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/today?day=${encodeURIComponent(day)}&code=${encodeURIComponent(code)}`, {
        method: "GET",
        cache: "no-store",
      });
      const json = (await res.json()) as TodayResponse;
      setData(json);

      if (!res.ok) setMsg(json.error ?? "Something went wrong.");
    } catch (e: any) {
      setMsg(e?.message ?? "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function toggle(who: "mike" | "gf") {
    setMsg("");
    if (!code) {
      setMsg("Enter the couple code first.");
      return;
    }
    setBusyWho(who);

    // figure the next value locally so the UI feels instant
    const current =
      who === "mike" ? Boolean(data?.mike_done) : Boolean(data?.gf_done);
    const nextValue = !current;

    try {
      const res = await fetch("/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          day,
          who,
          value: nextValue,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(json?.error ?? "Toggle failed.");
        return;
      }

      // refresh from server to be safe
      await fetchToday();
    } catch (e: any) {
      setMsg(e?.message ?? "Toggle failed.");
    } finally {
      setBusyWho(null);
    }
  }

  // auto-refresh when day changes (if code exists)
  useEffect(() => {
    if (code) fetchToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const mikeyDone = Boolean(data?.mike_done);
  const leeLeeDone = Boolean(data?.gf_done);

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: 42, marginBottom: 6 }}>Bible Check-in ✅</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Track daily reading for <b>Mikey</b> and <b>Lee Lee</b>.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginTop: 18,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Couple code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 7392"
            inputMode="numeric"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontWeight: 600 }}>Day</label>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #ddd",
            }}
          />
        </div>
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={fetchToday}
          disabled={loading || !code}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>

        <div style={{ opacity: 0.8 }}>
          <b>{niceDay}</b>
          {data?.updated_at ? (
            <span style={{ marginLeft: 8 }}>
              (updated {new Date(data.updated_at).toLocaleTimeString()})
            </span>
          ) : null}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <StatusCard
          name="Mikey"
          done={mikeyDone}
          onToggle={() => toggle("mike")}
          disabled={busyWho !== null || !code}
          busy={busyWho === "mike"}
        />

        <StatusCard
          name="Lee Lee"
          done={leeLeeDone}
          onToggle={() => toggle("gf")}
          disabled={busyWho !== null || !code}
          busy={busyWho === "gf"}
        />
      </div>

      {msg ? (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            background: "#fff7ed",
            border: "1px solid #fed7aa",
          }}
        >
          {msg}
        </div>
      ) : null}

      <div style={{ marginTop: 18, fontSize: 13, opacity: 0.75 }}>
        Tip: enter the code once, then you can change the date to check past days.
      </div>
    </main>
  );
}

function StatusCard(props: {
  name: string;
  done: boolean;
  onToggle: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  const { name, done, onToggle, disabled, busy } = props;
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{name}</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>
            Status:{" "}
            <b style={{ color: done ? "green" : "crimson" }}>
              {done ? "Done ✅" : "Not yet ❌"}
            </b>
          </div>
        </div>

        <button
          onClick={onToggle}
          disabled={disabled}
          style={{
            alignSelf: "start",
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ddd",
            cursor: disabled ? "not-allowed" : "pointer",
            fontWeight: 700,
            minWidth: 120,
          }}
        >
          {busy ? "Saving..." : done ? "Mark not done" : "Mark done"}
        </button>
      </div>
    </div>
  );
}
