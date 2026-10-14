"use client";

import { NumberOrderGame } from "./NumberOrderGame";

export function DeliverGame({
  onFinish,
}: {
  onFinish: (completed: boolean, closing?: string) => void;
}) {
  return (
    <NumberOrderGame accent="#683C95" numbers={[6, 1, 12, 3, 9, 2]} onFinish={onFinish} />
  );
}
