"use client";

import { useSyncExternalStore } from "react";

function getDateLabel() {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

export function CurrentDateLabel() {
  const dateLabel = useSyncExternalStore(
    () => () => undefined,
    getDateLabel,
    () => "HÔM NAY",
  );

  return <p className="eyebrow">{dateLabel || "HÔM NAY"}</p>;
}