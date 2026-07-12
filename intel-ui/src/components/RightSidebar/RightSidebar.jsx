import { TrendingUp, TrendingDown, Activity, ShieldAlert } from "lucide-react";
import "../../styles/Home.css";
// Widget 1 Data
const marketData = [
  { name: "NIFTY 50", value: "24,302.15", change: "+0.45%", isUp: true },
  { name: "S&P 500", value: "5,537.02", change: "-0.12%", isUp: false },
  { name: "BRENT CRUDE", value: "$86.54", change: "+1.20%", isUp: true },
  { name: "GOLD (OZ)", value: "$2,389.10", change: "+0.85%", isUp: true },
];
// Expanded Defense Equities!
const defenseEquities = [
  { name: "HAL (IND)", value: "₹4,520.10", change: "+2.40%", isUp: true },
  { name: "BEL (IND)", value: "₹310.45", change: "+1.15%", isUp: true },
  { name: "MAZAGON (IND)", value: "₹4,105.00", change: "-0.80%", isUp: false },
  { name: "COCHIN (IND)", value: "₹2,104.50", change: "+4.20%", isUp: true },
  { name: "BDL (IND)", value: "₹1,450.25", change: "+0.95%", isUp: true },
  { name: "BHARAT FORGE", value: "₹1,620.00", change: "+1.05%", isUp: true },
  { name: "ASTRA MICRO", value: "₹895.30", change: "+3.20%", isUp: true },
  { name: "LOCKHEED (US)", value: "$472.10", change: "+0.30%", isUp: true },
  { name: "RTX CORP (US)", value: "$104.22", change: "-0.15%", isUp: false },
  { name: "BOEING (US)", value: "$178.50", change: "-1.10%", isUp: false },
  { name: "BAE SYS (UK)", value: "£1,342.00", change: "+1.80%", isUp: true },
  { name: "THALES (FRA)", value: "€152.30", change: "+0.60%", isUp: true },
];
// Helper function to render a single row so we don't repeat ourselves
const renderEquityRow = (item, index) => (
  <div
    key={`${item.name}-${index}`}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <span
      style={{
        fontSize: "0.85rem",
        fontFamily: "var(--font-mono)",
        color: "var(--text-primary)",
        fontWeight: "bold",
      }}
    >
      {item.name}
    </span>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "4px",
      }}
    >
      <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
        {item.value}
      </span>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "0.75rem",
          fontFamily: "var(--font-mono)",
          color: item.isUp ? "var(--success)" : "var(--danger)",
        }}
      >
        {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {item.change}
      </span>
    </div>
  </div>
);
export default function RightSidebar() {
  return (
    <aside
      className="desktop-only"
      style={{
        width: "300px",
        height: "100vh",
        position: "fixed",
        right: 0,
        top: 0,
        padding: "40px 24px",
        borderLeft: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        zIndex: 100,
      }}
    >
      {/* GLOBAL MARKETS */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            margin: "0 0 20px 0",
            letterSpacing: "0.05em",
          }}
        >
          <Activity size={16} color="var(--accent)" /> GLOBAL MARKETS
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {marketData.map((item, i) => renderEquityRow(item, i))}
        </div>
      </div>
      {/* DEFENSE EQUITIES - WITH AUTO SCROLLING TICKER! */}
      <div
        style={{
          background: "var(--bg-surface)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.8rem",
            fontFamily: "var(--font-mono)",
            color: "var(--text-secondary)",
            margin: "0 0 20px 0",
            letterSpacing: "0.05em",
            paddingBottom: "10px",
          }}
        >
          <ShieldAlert size={16} color="var(--accent)" /> DEFENSE EQUITIES
        </h3>

        {/* Here is the magic wrapper! */}
        <div className="ticker-container">
          <div className="ticker-content">
            {/* We map the list the FIRST time */}
            {defenseEquities.map((item, i) =>
              renderEquityRow(item, `first-${i}`),
            )}

            {/* We map the EXACT SAME list a SECOND time right underneath it! */}
            {defenseEquities.map((item, i) =>
              renderEquityRow(item, `second-${i}`),
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
