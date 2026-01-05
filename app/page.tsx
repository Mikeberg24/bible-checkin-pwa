"use client";

import { useEffect, useState } from "react";

type Status = {
  mikey: boolean;
  leelee: boolean;
};

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/today?day=2026-01-07&code=2424")
      .then((res) => res.json())
      .then(setStatus);
  }, []);

  if (!status) return <p>Loading...</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Bible Check-In</h1>

      <p>Mikey: {status.mikey ? "✅" : "❌"}</p>
      <p>Lee Lee: {status.leelee ? "✅" : "❌"}</p>
    </main>
  );
}
