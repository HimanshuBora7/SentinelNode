import { useState, useMemo } from "react";

export default function Logo({ status = "online", size = 40 }) {
  const palette = {
    online: {
      accent: "#60A5FA",
      accentAlt: "#93C5FD",
      glow: "rgba(96,165,250,0.8)",
      bg: "rgba(96,165,250,0.1)",
    },
    scanning: {
      accent: "#4ADE80",
      accentAlt: "#86EFAC",
      glow: "rgba(74,222,128,0.8)",
      bg: "rgba(74,222,128,0.1)",
    },
    alert: {
      accent: "#F87171",
      accentAlt: "#FCA5A5",
      glow: "rgba(248,113,113,0.9)",
      bg: "rgba(248,113,113,0.15)",
    },
    standby: {
      accent: "#FBBF24",
      accentAlt: "#FDE047",
      glow: "rgba(251,191,36,0.7)",
      bg: "rgba(251,191,36,0.1)",
    },
    offline: {
      accent: "#94A3B8",
      accentAlt: "#CBD5E1",
      glow: "rgba(203,213,225,0.4)",
      bg: "rgba(148,163,184,0.1)",
    },
  };

  const { accent, accentAlt, glow, bg } = palette[status] || palette.online;

  /* Use a static prefix for SVG filters to prevent flickering on re-renders */
  const uid = "sn-header-logo";

  /* node positions — diamond + core */
  const core = { cx: 50, cy: 50 };
  const nodes = [
    { cx: 50, cy: 14 }, // N
    { cx: 86, cy: 50 }, // E
    { cx: 50, cy: 86 }, // S
    { cx: 14, cy: 50 }, // W
  ];
  const diagNodes = [
    { cx: 74, cy: 26 }, // NE
    { cx: 74, cy: 74 }, // SE
    { cx: 26, cy: 74 }, // SW
    { cx: 26, cy: 26 }, // NW
  ];

  /* animation speeds per status */
  const speed = {
    online: { pulse: "3s", orbit: "8s", sweep: "0s" },
    scanning: { pulse: "1.5s", orbit: "3s", sweep: "2s" },
    alert: { pulse: "0.6s", orbit: "1.2s", sweep: "0s" },
    standby: { pulse: "5s", orbit: "12s", sweep: "0s" },
    offline: { pulse: "0s", orbit: "0s", sweep: "0s" },
  };
  const s = speed[status] || speed.online;

  const keyframes = `
    /* ── Core pulse ── */
    @keyframes ${uid}-pulse {
      0%, 100% { opacity: 0.5; }
      50%      { opacity: 0.12; }
    }

    /* ── Core breathe (scale via r doesn't work, use transform) ── */
    @keyframes ${uid}-breathe {
      0%, 100% { transform: scale(1);   }
      50%      { transform: scale(1.18); }
    }

    /* ── Orbiting particles around core ── */
    @keyframes ${uid}-orbit {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }

    /* ── Counter-orbit (inner ring) ── */
    @keyframes ${uid}-orbit-rev {
      from { transform: rotate(360deg); }
      to   { transform: rotate(0deg);   }
    }

    /* ── Radar sweep ── */
    @keyframes ${uid}-sweep {
      from { transform: rotate(0deg);   }
      to   { transform: rotate(360deg); }
    }

    /* ── Alert shake ── */
    @keyframes ${uid}-shake {
      0%, 100% { transform: translateX(0);    }
      20%      { transform: translateX(-1.5px); }
      40%      { transform: translateX(1.5px);  }
      60%      { transform: translateX(-1px);  }
      80%      { transform: translateX(1px);   }
    }

    /* ── Offline glitch ── */
    @keyframes ${uid}-glitch {
      0%, 90%, 100% { opacity: 0.35; }
      92%           { opacity: 0.1; transform: translate(1px, -1px); }
      94%           { opacity: 0.5; transform: translate(-1px, 0.5px); }
      96%           { opacity: 0.15; }
      98%           { opacity: 0.4; transform: translate(0.5px, 1px); }
    }

    /* ── Data flow along connections ── */
    @keyframes ${uid}-flow {
      0%   { stroke-dashoffset: 16; }
      100% { stroke-dashoffset: 0;  }
    }

    /* ── Node appear ── */
    @keyframes ${uid}-node-pop {
      0%   { r: 0; opacity: 0;  }
      60%  { r: 5; opacity: 1;  }
      80%  { r: 3.5; }
      100% { r: 4; opacity: 0.85; }
    }

    /* ── Scanning ring expand ── */
    @keyframes ${uid}-ring-expand {
      0%   { r: 10; opacity: 0.5; stroke-width: 2; }
      100% { r: 46; opacity: 0;   stroke-width: 0.3; }
    }
  `;

  const isOnline = status === "online";
  const isScanning = status === "scanning";
  const isAlert = status === "alert";
  const isStandby = status === "standby";
  const isOffline = status === "offline";

  /* root animation for the whole SVG */
  const rootStyle = {
    display: "block",
    ...(isAlert && { animation: `${uid}-shake 0.4s ease-in-out infinite` }),
    ...(isOffline && { animation: `${uid}-glitch 3s steps(1) infinite` }),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`SentinelNode — ${status}`}
      style={rootStyle}
    >
      <defs>
        <style>{keyframes}</style>

        {/* Core glow filter */}
        <filter id={`${uid}-glow`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle outer glow for nodes */}
        <filter
          id={`${uid}-node-glow`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Core radial gradient */}
        <radialGradient id={`${uid}-core-grad`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="50%" stopColor={accentAlt} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="1" />
        </radialGradient>

        {/* Radar sweep gradient (conical feel via linearGradient) */}
        <linearGradient id={`${uid}-sweep-grad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ══════════════════════════════════════
           LAYER 1 — Background field
         ══════════════════════════════════════ */}
      <circle cx="50" cy="50" r="46" fill={bg} />

      {/* ── Radar range rings ── */}
      {[46, 34, 22].map((r, i) => (
        <circle
          key={`ring-${i}`}
          cx="50"
          cy="50"
          r={r}
          stroke={accent}
          strokeWidth={0.6 - i * 0.15}
          strokeDasharray={`${3 - i * 0.5} ${5 + i}`}
          opacity={0.15 - i * 0.03}
          fill="none"
        />
      ))}

      {/* ── Scanning: expanding sonar rings ── */}
      {isScanning &&
        [0, 1, 2].map((i) => (
          <circle
            key={`sonar-${i}`}
            cx="50"
            cy="50"
            r="10"
            fill="none"
            stroke={accent}
            strokeWidth="1.5"
            style={{
              animation: `${uid}-ring-expand 2.4s ease-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}

      {/* ══════════════════════════════════════
           LAYER 2 — Connections (core → cardinal)
         ══════════════════════════════════════ */}
      {nodes.map((n, i) => (
        <line
          key={`conn-${i}`}
          x1={core.cx}
          y1={core.cy}
          x2={n.cx}
          y2={n.cy}
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity={isOffline ? 0.15 : 0.45}
          {...(isScanning && {
            strokeDasharray: "4 4",
            style: {
              animation: `${uid}-flow 0.8s linear infinite`,
              animationDelay: `${i * 0.2}s`,
            },
          })}
        />
      ))}

      {/* ── Mesh connections (cardinal → diagonal neighbours) ── */}
      {[
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ].map(([a, b], i) => (
        <line
          key={`mesh-${i}`}
          x1={nodes[a].cx}
          y1={nodes[a].cy}
          x2={nodes[b].cx}
          y2={nodes[b].cy}
          stroke={accent}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity={isOffline ? 0.08 : 0.18}
          {...(isOffline && {
            strokeDasharray: "2 4",
          })}
        />
      ))}

      {/* ── Inner web (diagonal nodes → core) ── */}
      {diagNodes.map((n, i) => (
        <line
          key={`inner-${i}`}
          x1={core.cx}
          y1={core.cy}
          x2={n.cx}
          y2={n.cy}
          stroke={accent}
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity={isOffline ? 0.06 : 0.12}
        />
      ))}

      {/* ══════════════════════════════════════
           LAYER 3 — Radar sweep (scanning only)
         ══════════════════════════════════════ */}
      {isScanning && (
        <g
          style={{
            transformOrigin: "50px 50px",
            animation: `${uid}-sweep ${s.sweep} linear infinite`,
          }}
        >
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="4"
            stroke={accent}
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* sweep "tail" arc */}
          <path
            d="M50 50 L50 6 A44 44 0 0 1 80 18 Z"
            fill={accent}
            opacity="0.08"
          />
        </g>
      )}

      {/* ══════════════════════════════════════
           LAYER 4 — Satellite nodes
         ══════════════════════════════════════ */}

      {/* Glow layer (behind solid nodes) */}
      {!isOffline &&
        nodes.map((n, i) => (
          <circle
            key={`nglow-${i}`}
            cx={n.cx}
            cy={n.cy}
            r="6"
            fill={accent}
            filter={`url(#${uid}-node-glow)`}
            opacity="0.3"
          />
        ))}

      {/* Cardinal nodes */}
      {nodes.map((n, i) => (
        <circle
          key={`node-${i}`}
          cx={n.cx}
          cy={n.cy}
          r={isOffline ? 3 : 4}
          fill={accent}
          opacity={isOffline ? 0.3 : 0.85}
        />
      ))}

      {/* Diagonal (secondary) nodes — smaller */}
      {diagNodes.map((n, i) => (
        <circle
          key={`dnode-${i}`}
          cx={n.cx}
          cy={n.cy}
          r={isOffline ? 1.5 : 2.5}
          fill={accentAlt}
          opacity={isOffline ? 0.15 : 0.5}
        />
      ))}

      {/* ══════════════════════════════════════
           LAYER 5 — Orbiting particles
         ══════════════════════════════════════ */}
      {!isOffline && (
        <>
          {/* Outer orbit ring */}
          <g
            style={{
              transformOrigin: "50px 50px",
              animation: `${uid}-orbit ${s.orbit} linear infinite`,
            }}
          >
            <circle cx="50" cy="8" r="1.8" fill={accentAlt} opacity="0.7" />
            <circle cx="92" cy="50" r="1.2" fill={accent} opacity="0.5" />
            <circle cx="50" cy="92" r="1.5" fill={accentAlt} opacity="0.6" />
          </g>

          {/* Inner counter-orbit */}
          <g
            style={{
              transformOrigin: "50px 50px",
              animation: `${uid}-orbit-rev ${s.orbit} linear infinite`,
            }}
          >
            <circle cx="50" cy="28" r="1.2" fill={accentAlt} opacity="0.45" />
            <circle cx="72" cy="50" r="1" fill={accent} opacity="0.35" />
          </g>
        </>
      )}

      {/* ══════════════════════════════════════
           LAYER 6 — Core node
         ══════════════════════════════════════ */}

      {/* Pulse ring */}
      {!isOffline && (
        <circle
          cx={core.cx}
          cy={core.cy}
          r="14"
          fill="none"
          stroke={glow}
          strokeWidth="2"
          style={{
            animation: `${uid}-pulse ${s.pulse} ease-in-out infinite`,
            transformOrigin: "50px 50px",
          }}
        />
      )}

      {/* Breathe wrapper for core */}
      <g
        style={{
          transformOrigin: "50px 50px",
          ...(!isOffline && {
            animation: `${uid}-breathe ${s.pulse} ease-in-out infinite`,
          }),
        }}
      >
        {/* Core glow background */}
        <circle
          cx={core.cx}
          cy={core.cy}
          r="10"
          fill={accent}
          filter={`url(#${uid}-glow)`}
          opacity={isOffline ? 0.15 : 0.6}
        />

        {/* Core solid circle with gradient */}
        <circle
          cx={core.cx}
          cy={core.cy}
          r={isOffline ? 7 : 9}
          fill={`url(#${uid}-core-grad)`}
        />

        {/* Specular highlight */}
        <circle
          cx={core.cx - 3}
          cy={core.cy - 3}
          r="2.5"
          fill="white"
          opacity={isOffline ? 0.08 : 0.3}
        />
      </g>

      {/* ══════════════════════════════════════
           LAYER 7 — Offline broken lines overlay
         ══════════════════════════════════════ */}
      {isOffline && (
        <g opacity="0.2">
          {/* X mark across the core */}
          <line
            x1="42"
            y1="42"
            x2="58"
            y2="58"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="58"
            y1="42"
            x2="42"
            y2="58"
            stroke="#EF4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* ── Alert: outer danger ring ── */}
      {isAlert && (
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          opacity="0.35"
          strokeDasharray="6 3"
          style={{
            animation: `${uid}-flow 1s linear infinite`,
          }}
        />
      )}
    </svg>
  );
}
