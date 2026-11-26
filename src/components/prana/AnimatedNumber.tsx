"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useSpring } from "framer-motion";

export default function AnimatedNumber({
  value,
  digits = 0,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number;
  digits?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 90, damping: 18, mass: 0.6 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useMotionValueEvent(spring, "change", (latest) => {
    setDisplay(latest);
  });

  return (
    <span className={`num ${className}`}>
      {prefix}
      {display.toLocaleString("en-US", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })}
      {suffix}
    </span>
  );
}
