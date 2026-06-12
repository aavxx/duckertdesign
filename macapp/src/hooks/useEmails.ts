import { useEffect } from "react";
import { fetchEmails } from "../api";
import { useStore } from "../store";

export function useEmails() {
  const setEmails = useStore((s) => s.setEmails);

  useEffect(() => {
    fetchEmails()
      .then(setEmails)
      .catch(console.error);
  }, [setEmails]);
}
