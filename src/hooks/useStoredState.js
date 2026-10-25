import { useEffect, useState } from "react";

export default function useStoredState(
  key,
  fallback,
  validate = (value) => value,
) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? validate(JSON.parse(stored)) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* The site remains usable when storage is full or disabled. */
    }
  }, [key, value]);
  return [value, setValue];
}
