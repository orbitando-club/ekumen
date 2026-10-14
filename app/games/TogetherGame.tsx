"use client";

import { NumberOrderGame } from "./NumberOrderGame";

export function TogetherGame({ onFinish }: { onFinish: (completed: boolean) => void }) {
  return (
    <NumberOrderGame accent="#448FF4" numbers={[15, 3, 8, 11, 1]} onFinish={onFinish} />
  );
}
