"use client";

import { useEffect, useState } from "react";

/** Local time in Chicago, ticking. */
export function ChicagoClock({ seconds = true }: { seconds?: boolean }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      hour: "2-digit",
      minute: "2-digit",
      ...(seconds ? { second: "2-digit" } : {}),
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [seconds]);
  return <span className="tabular-nums">{now || "--:--"}</span>;
}
