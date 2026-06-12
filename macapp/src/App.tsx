import { useSSE } from "./hooks/useSSE";
import { useEmails } from "./hooks/useEmails";
import { useChats } from "./hooks/useChats";
import { useStore } from "./store";
import { Sidebar } from "./components/Sidebar";
import { EmailPane } from "./components/EmailPane";
import { ChatPane } from "./components/ChatPane";

export default function App() {
  // Connect SSE and load initial data
  useSSE();
  useEmails();
  useChats();

  const activePane = useStore((s) => s.activePane);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#fff" }}>
      <Sidebar />
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        {activePane === "email" ? <EmailPane /> : <ChatPane />}
      </div>
    </div>
  );
}
