"use client";

import { NumberOrderGame } from "./NumberOrderGame";

export function HappenGame({ onFinish }: { onFinish: (completed: boolean) => void }) {
  return (
    <NumberOrderGame accent="#775DFD" numbers={[42, 7, 19]} onFinish={onFinish} />
  );
}
