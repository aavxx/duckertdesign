import { useStore } from "../store";

const BRAND = "#1647FB";

export function Sidebar() {
  const { activePane, setActivePane, unreadEmails, unreadChats, connected } = useStore();

  return (
    <div style={{
      width: "60px",
      background: "#1a1a2e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "16px",
      gap: "8px",
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: BRAND, display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "8px",
      }}>
        <span style={{ color: "#fff", fontWeight: 800, fontSize: "14px" }}>D</span>
      </div>

      {/* Email tab */}
      <NavBtn
        label="Email"
        active={activePane === "email"}
        badge={unreadEmails}
        onClick={() => setActivePane("email")}
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,4 12,13 2,4" />
          </svg>
        }
      />

      {/* Chat tab */}
      <NavBtn
        label="Chat"
        active={activePane === "chat"}
        badge={unreadChats}
        onClick={() => setActivePane("chat")}
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
      />

      <div style={{ flex: 1 }} />

      {/* Connection indicator */}
      <div style={{
        width: "8px", height: "8px", borderRadius: "50%",
        background: connected ? "#22c55e" : "#ef4444",
        marginBottom: "16px",
        title: connected ? "Tilsluttet" : "Ikke tilsluttet",
      }} />
    </div>
  );
}

function NavBtn({
  label, active, badge, onClick, icon,
}: {
  label: string;
  active: boolean;
  badge: number;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        position: "relative",
        width: "44px", height: "44px",
        borderRadius: "10px",
        border: "none",
        background: active ? "rgba(22,71,251,0.25)" : "transparent",
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s",
      }}
    >
      {icon}
      {badge > 0 && (
        <span style={{
          position: "absolute", top: "4px", right: "4px",
          background: "#ef4444", color: "#fff",
          fontSize: "9px", fontWeight: 700,
          width: "16px", height: "16px",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
