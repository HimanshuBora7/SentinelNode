import React from 'react';
import Header from "../components/Header/Header";
import BottomNav from "../components/BottomNav/BottomNav";
import { TrendingUp, TrendingDown, Activity, ShieldAlert, Search as SearchIcon } from "lucide-react";

const marketData = [
  { name: "NIFTY 50", value: "24,302.15", change: "+0.45%", isUp: true },
  { name: "S&P 500", value: "5,537.02", change: "-0.12%", isUp: false },
  { name: "BRENT CRUDE", value: "$86.54", change: "+1.20%", isUp: true },
  { name: "GOLD (OZ)", value: "$2,389.10", change: "+0.85%", isUp: true },
];

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

export default function Search() {
  return (
    <div className="home"> 
      <Header />
      
      <main className="container" style={{ paddingTop: '24px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
            <SearchIcon size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
            <input 
                type="text" 
                placeholder="Search intelligence & markets..." 
                style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    outline: 'none'
                }}
            />
        </div>

        {/* --- WIDGET 1: GLOBAL MARKETS --- */}
        <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", margin: "0 0 20px 0", letterSpacing: "0.05em" }}>
            <Activity size={16} color="var(--accent)" /> GLOBAL MARKETS
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {marketData.map((item) => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: "bold" }}>{item.name}</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{item.value}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: item.isUp ? "var(--success)" : "var(--danger)" }}>
                    {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- WIDGET 2: DEFENSE EQUITIES --- */}
        <div style={{ background: "var(--bg-surface)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-secondary)", margin: "0 0 20px 0", letterSpacing: "0.05em" }}>
            <ShieldAlert size={16} color="var(--accent)" /> DEFENSE EQUITIES
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {defenseEquities.map((item) => (
              <div key={item.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)", fontWeight: "bold" }}>{item.name}</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{item.value}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: item.isUp ? "var(--success)" : "var(--danger)" }}>
                    {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {item.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
      
      <BottomNav />
    </div>
  );
}
