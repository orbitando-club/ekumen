"use client";

import { NumberOrderGame } from "./NumberOrderGame";

export function ThinkGame({ onFinish }: { onFinish: (completed: boolean) => void }) {
  return (
    <NumberOrderGame accent="#2B65E7" numbers={[7, 2, 9, 4]} onFinish={onFinish} />
  );
}
