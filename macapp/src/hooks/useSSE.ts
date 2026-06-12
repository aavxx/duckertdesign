import { useEffect, useRef } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useStore } from "../store";
import { SSE_URL, ADMIN_KEY } from "../api";
import type { EmailSummary, ChatSession, ChatMessage } from "../store";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "https://duckert.design";

async function notify(title: string, body: string) {
  try {
    let granted = await isPermissionGranted();
    if (!granted) {
      const perm = await requestPermission();
      granted = perm === "granted";
    }
    if (granted) sendNotification({ title, body });
  } catch {
    // Notification API unavailable in dev browser
  }
}

export function useSSE() {
  const store = useStore();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let retryDelay = 1000;

    async function connect() {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        await fetchEventSource(SSE_URL, {
          headers: { "X-Admin-Key": ADMIN_KEY },
          signal: ctrl.signal,
          onopen: async (res) => {
            if (res.ok) {
              store.setConnected(true);
              retryDelay = 1000;
            }
          },
          onmessage: async (ev) => {
            if (!ev.data || ev.data.startsWith(":")) return;
            try {
              const event = JSON.parse(ev.data);
              await handleEvent(event, store);
            } catch {}
          },
          onclose: () => {
            store.setConnected(false);
            scheduleReconnect();
          },
          onerror: () => {
            store.setConnected(false);
            scheduleReconnect();
            throw new Error("SSE error — will retry");
          },
        });
      } catch {
        scheduleReconnect();
      }
    }

    function scheduleReconnect() {
      if (abortRef.current?.signal.aborted) return;
      setTimeout(() => {
        retryDelay = Math.min(retryDelay * 2, 30_000);
        connect();
      }, retryDelay);
    }

    connect();

    return () => {
      abortRef.current?.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

async function handleEvent(
  event: { type: string; [key: string]: unknown },
  store: ReturnType<typeof useStore.getState>
) {
  if (event.type === "new_email") {
    const email: EmailSummary = {
      uid: event.uid as string,
      from: event.from as string,
      subject: event.subject as string,
      date: new Date(event.ts as number).toISOString(),
      seen: false,
    };
    store.prependEmail(email);
    await notify("Ny email", `Fra: ${email.from}\n${email.subject}`);
  }

  if (event.type === "new_chat_session") {
    const sessionId = event.sessionId as string;
    // Fetch updated session list
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/chats`, {
        headers: { "X-Admin-Key": ADMIN_KEY },
      });
      if (res.ok) {
        const sessions: ChatSession[] = await res.json();
        store.setSessions(sessions);
      }
    } catch {}
    const isHuman = event.humanRequested as boolean | undefined;
    await notify(
      isHuman ? "Kunde ønsker menneskelig hjælp" : "Ny chat-session",
      `Session: ${sessionId.slice(0, 8)}…`
    );
  }

  if (event.type === "new_chat_message") {
    const msg: ChatMessage = {
      id: event.messageId as string,
      role: event.role as "user" | "admin",
      content: event.content as string,
      ts: event.ts as number,
    };
    store.appendChatMessage(event.sessionId as string, msg);

    if (event.role === "user") {
      await notify("Ny besked i chat", (event.content as string).slice(0, 80));
    }
  }
}

// Expose a hook to navigate to item from notification click
export async function focusAndNavigate(pane: "email" | "chat", id: string) {
  try {
    const win = getCurrentWindow();
    await win.show();
    await win.setFocus();
  } catch {}
  useStore.getState().navigateTo(pane, id);
}
