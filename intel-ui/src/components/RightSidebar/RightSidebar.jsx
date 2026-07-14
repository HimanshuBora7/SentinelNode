import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, ShieldAlert } from "lucide-react";
import "../../styles/Home.css";

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
  // 1. Initial State using your default fallback data
  const [marketData, setMarketData] = useState([
    { name: "NIFTY 50", value: "24,302.15", change: "+0.45%", isUp: true },
    { name: "S&P 500", value: "5,537.02", change: "-0.12%", isUp: false },
    { name: "BRENT CRUDE", value: "$86.54", change: "+1.20%", isUp: true },
    { name: "GOLD (OZ)", value: "$2,389.10", change: "+0.85%", isUp: true },
  ]);

  const [defenseEquities, setDefenseEquities] = useState([
    { name: "HAL (IND)", value: "₹4,520.10", change: "+2.40%", isUp: true },
    { name: "BEL (IND)", value: "₹310.45", change: "+1.15%", isUp: true },
    {
      name: "MAZAGON (IND)",
      value: "₹4,105.00",
      change: "-0.80%",
      isUp: false,
    },
    { name: "COCHIN (IND)", value: "₹2,104.50", change: "+4.20%", isUp: true },
    { name: "BDL (IND)", value: "₹1,450.25", change: "+0.95%", isUp: true },
    { name: "BHARAT FORGE", value: "₹1,620.00", change: "+1.05%", isUp: true },
    { name: "ASTRA MICRO", value: "₹895.30", change: "+3.20%", isUp: true },
    { name: "LOCKHEED (US)", value: "$472.10", change: "+0.30%", isUp: true },
    { name: "RTX CORP (US)", value: "$104.22", change: "-0.15%", isUp: false },
    { name: "BOEING (US)", value: "$178.50", change: "-1.10%", isUp: false },
    { name: "BAE SYS (UK)", value: "£1,342.00", change: "+1.80%", isUp: true },
    { name: "THALES (FRA)", value: "€152.30", change: "+0.60%", isUp: true },
  ]);

  // 2. Fetch Live Data on Component Mount
  useEffect(() => {
    // In Vite React apps, environment variables must start with VITE_ and are accessed via import.meta.env
    // Ensure you have VITE_FINNHUB_API=your_token in your .env file
    const API_KEY = import.meta.env.VITE_FINNHUB_API || "YOUR_FINNHUB_TOKEN_HERE";

    // Helper to fetch and format Finnhub data
    const fetchFinnhubQuote = async (symbol, displayName, prefix = "$") => {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`,
        );
        const data = await response.json();

        // Check for 403 or missing properties (Finnhub free tier often restricts international stocks)
        if (response.status === 403 || data.error || data.c === undefined || data.pc === undefined || (data.c === 0 && data.pc === 0)) {
          console.warn(`⚠️ Skipping ${symbol}: ${data.error || "Not supported on free tier or rate limited."}`);
          return null;
        }

        const changePercent = ((data.c - data.pc) / data.pc) * 100;
        const isUp = changePercent >= 0;

        console.log(`✅ Fetched ${symbol}: Price ${data.c}, PrevClose ${data.pc}`);

        return {
          name: displayName,
          value: `${prefix}${data.c.toFixed(2)}`,
          change: `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`,
          isUp: isUp,
        };
      } catch (error) {
        console.error(`❌ Error fetching ${symbol}:`, error);
        return null;
      }
    };

    // Helper to batch array into chunks
    const chunkArray = (array, size) => {
      const chunked = [];
      for (let i = 0; i < array.length; i += size) {
        chunked.push(array.slice(i, i + size));
      }
      return chunked;
    };

    const fetchLiveStocks = async () => {
      if (!API_KEY || API_KEY === "YOUR_FINNHUB_TOKEN_HERE") {
        console.warn("Please add your Finnhub API key to see live data!");
        return;
      }

      console.log("🔄 Starting data fetch cycle...");

      // Define all equities we want to fetch
      const equitiesToFetch = [
        { symbol: "HAL.NS", name: "HAL (IND)", prefix: "₹" },
        { symbol: "BEL.NS", name: "BEL (IND)", prefix: "₹" },
        { symbol: "MAZDOCK.NS", name: "MAZAGON (IND)", prefix: "₹" },
        { symbol: "COCHINSHIP.NS", name: "COCHIN (IND)", prefix: "₹" },
        { symbol: "BDL.NS", name: "BDL (IND)", prefix: "₹" },
        { symbol: "BHARATFORG.NS", name: "BHARAT FORGE", prefix: "₹" },
        { symbol: "ASTRAMICRO.NS", name: "ASTRA MICRO", prefix: "₹" },
        { symbol: "LMT", name: "LOCKHEED (US)", prefix: "$" },
        { symbol: "RTX", name: "RTX CORP (US)", prefix: "$" },
        { symbol: "BA", name: "BOEING (US)", prefix: "$" },
        { symbol: "BA.L", name: "BAE SYS (UK)", prefix: "£" },
        { symbol: "HO.PA", name: "THALES (FRA)", prefix: "€" },
      ];

      // Batch requests into groups of 4 to avoid overwhelming the browser or API burst limits
      const batches = chunkArray(equitiesToFetch, 4);
      let validLiveDefense = [];

      for (const batch of batches) {
        const batchResults = await Promise.all(
          batch.map((eq) => fetchFinnhubQuote(eq.symbol, eq.name, eq.prefix))
        );
        validLiveDefense = [...validLiveDefense, ...batchResults.filter((item) => item !== null)];
        
        // Small delay between batches (500ms) to be safe against burst limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (validLiveDefense.length > 0) {
        setDefenseEquities((prev) => {
          const newArray = [...prev];
          validLiveDefense.forEach((liveItem) => {
            const index = newArray.findIndex((item) => item.name === liveItem.name);
            if (index !== -1) newArray[index] = liveItem;
          });
          return newArray;
        });
      }

      // Fetch Market Index Example
      const liveMarketData = await Promise.all([
        fetchFinnhubQuote("SPY", "S&P 500", "$"),
        // Example for NIFTY 50: ^NSEI on Yahoo, not fully supported on free Finnhub sometimes, but let's try
        // fetchFinnhubQuote("^NSEI", "NIFTY 50", "₹"), 
      ]);

      const validMarketData = liveMarketData.filter((item) => item !== null);
      if (validMarketData.length > 0) {
        setMarketData((prev) => {
          const newArray = [...prev];
          validMarketData.forEach((liveItem) => {
            const index = newArray.findIndex((item) => item.name === liveItem.name);
            if (index !== -1) newArray[index] = liveItem;
          });
          return newArray;
        });
      }
      
      console.log("✅ Data fetch cycle complete!");
    };

    // Initial Fetch
    fetchLiveStocks();

    // Refresh every 60 seconds
    const intervalId = setInterval(fetchLiveStocks, 60000);
    return () => clearInterval(intervalId);
  }, []);

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
