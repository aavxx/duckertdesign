import { useEffect } from "react";
import { fetchChats } from "../api";
import { useStore } from "../store";

export function useChats() {
  const setSessions = useStore((s) => s.setSessions);

  useEffect(() => {
    fetchChats()
      .then(setSessions)
      .catch(console.error);
  }, [setSessions]);
}
