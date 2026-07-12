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
