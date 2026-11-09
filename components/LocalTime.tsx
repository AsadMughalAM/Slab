"use client";

import { useEffect, useState } from "react";

import { STUDIO } from "@/lib/content";

/** The studio's local time, ticking. Renders a stable placeholder on the server. */
export default function LocalTime({ seconds = true }: { seconds?: boolean }) {
  const [now, setNow] = useState<string>("--:--" + (seconds ? ":--" : ""));

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: STUDIO.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: false,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return <time className="tabular-nums">{now}</time>;
}
