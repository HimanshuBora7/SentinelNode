import { Link } from "react-router-dom";
import "../styles/IntelligenceCard.css";

function timeAgo(timestamp) {
  if (!timestamp) return "unknown";
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function IntelligenceCard({ post }) {
  return (
    <Link
      to={`/detail/${post.post_id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <article className="intel-card">
        <h2 className="intel-card__title">{post.headline || post.summary}</h2>
        {/* News vs Opinion Badge */}
        <span
          style={{
            display: "inline-block",
            background:
              post.content_type === "OPINION"
                ? "#4a1515"
                : post.content_type === "ANALYSIS"
                  ? "#152f4a"
                  : "var(--bg-elevated)",
            color:
              post.content_type === "OPINION"
                ? "#ff6b6b"
                : post.content_type === "ANALYSIS"
                  ? "#6b9cff"
                  : "var(--text-secondary)",
            padding: "2px 8px",
            borderRadius: "4px",
            fontSize: "0.65rem",
            fontFamily: "var(--font-mono)",
            marginBottom: "12px",
            marginTop: "8px",
            border: "1px solid currentColor",
            letterSpacing: "0.05em",
          }}
        >
          {post.content_type}
        </span>

        <p className="intel-card__summary">{post.summary}</p>

        <div className="intel-card__meta">
          <span>@{post.account_handle}</span>
          {post.additional_sources_count > 0 && (
            <span className="source-badge">
              +{post.additional_sources_count}{" "}
              {post.additional_sources_count === 1 ? "source" : "sources"}
            </span>
          )}
          <span>•</span>
          <span>{timeAgo(post.timestamp)}</span>
        </div>
      </article>
    </Link>
  );
}
