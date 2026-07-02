import { useState } from "react";
import Logo from "../components/Logo";

const states = ["online", "scanning", "alert", "standby", "offline"];

const labels = {
  online:   "System Online",
  scanning: "Scanning Intel",
  alert:    "Threat Detected",
  standby:  "Standby Mode",
  offline:  "Connection Lost",
};

const descriptions = {
  online:   "All nodes active — calm pulse, orbiting particles",
  scanning: "Radar sweep — sonar rings, data flowing through mesh",
  alert:    "Urgent — red shake, rapid pulse, danger ring",
  standby:  "Low power — slow breathing, amber glow",
  offline:  "Disconnected — glitch, broken connections, X mark",
};

export default function LogoDemo() {
  const [activeStatus, setActiveStatus] = useState("online");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#090c12",
      color: "#f5f7fa",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 20px",
    }}>
      <h1 style={{
        fontSize: "1.5rem",
        fontWeight: 600,
        marginBottom: 8,
        letterSpacing: "-0.02em",
      }}>
        SentinelNode Logo States
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: 40 }}>
        Click a state to see the hero logo change
      </p>

      {/* Hero — large interactive logo */}
      <div style={{
        width: 160,
        height: 160,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 24,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        marginBottom: 16,
      }}>
        <Logo size={120} status={activeStatus} />
      </div>

      <div style={{
        fontSize: "1.1rem",
        fontWeight: 600,
        marginBottom: 4,
      }}>
        {labels[activeStatus]}
      </div>
      <div style={{
        fontSize: "0.8rem",
        color: "#94a3b8",
        marginBottom: 48,
        textAlign: "center",
        maxWidth: 320,
      }}>
        {descriptions[activeStatus]}
      </div>

      {/* State buttons grid */}
      <div style={{
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {states.map(st => (
          <button
            key={st}
            onClick={() => setActiveStatus(st)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "16px 20px",
              borderRadius: 16,
              border: activeStatus === st
                ? "1.5px solid rgba(79,140,255,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
              background: activeStatus === st
                ? "rgba(79,140,255,0.08)"
                : "rgba(255,255,255,0.02)",
              cursor: "pointer",
              color: "#f5f7fa",
              transition: "all 0.2s ease",
              minWidth: 110,
            }}
          >
            <Logo size={48} status={st} />
            <span style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: activeStatus === st ? "#f5f7fa" : "#94a3b8",
            }}>
              {st}
            </span>
          </button>
        ))}
      </div>

      {/* Size showcase */}
      <div style={{
        marginTop: 56,
        display: "flex",
        alignItems: "flex-end",
        gap: 20,
      }}>
        {[24, 32, 40, 56, 80].map(sz => (
          <div key={sz} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}>
            <Logo size={sz} status={activeStatus} />
            <span style={{ fontSize: "0.65rem", color: "#64748b" }}>{sz}px</span>
          </div>
        ))}
      </div>
    </div>
  );
}
