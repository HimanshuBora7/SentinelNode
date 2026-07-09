import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

export default function Detail() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/feed/${postId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) setPost(data.post);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [postId]);

  if (loading) return <div style={{ padding: 24, color: 'var(--text-secondary)' }}>Decrypting transmission...</div>;
  if (!post) return <div style={{ padding: 24, color: 'var(--danger)' }}>Intelligence record not found or classified.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: "0 auto", paddingBottom: 120 }}>
      <Link to="/" style={{ color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: 24, display: "inline-block" }}>
        ← RETURN TO FEED
      </Link>
      
      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 16, marginBottom: 24 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", letterSpacing: "0.1em", marginBottom: 12 }}>
          {post.category.toUpperCase()} // PRIORITY {post.importance}
        </div>
        <h1 style={{ margin: 0, fontSize: "1.8rem", lineHeight: 1.3, color: "var(--text-primary)" }}>{post.headline || post.summary}</h1>
      </div>

      <div style={{ background: "var(--bg-surface)", padding: 20, borderRadius: 12, marginBottom: 24, border: "1px solid var(--border)" }}>
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0 0 12px 0", letterSpacing: "0.1em" }}>ANALYTICAL SUMMARY</h3>
        <p style={{ margin: 0, lineHeight: 1.6, color: "var(--text-primary)" }}>{post.summary}</p>
      </div>

      <div style={{ background: "var(--bg-elevated)", padding: 20, borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0, letterSpacing: "0.1em" }}>RAW INTERCEPT</h3>
          {post.post_url && (
            <a href={post.post_url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>
              VIEW ORIGINAL ↗
            </a>
          )}
        </div>
        <p style={{ margin: 0, lineHeight: 1.6, fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-secondary)" }}>"{post.original_text}"</p>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
         <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 4 }}>SOURCE</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--text-primary)" }}>@{post.account_handle}</div>
         </div>
         <div style={{ padding: 16, border: "1px solid var(--border)", borderRadius: 8 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: 4 }}>CONFIDENCE</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "var(--success)" }}>{Math.round(post.confidence_score * 100)}%</div>
         </div>
      </div>
    </div>
  );
}
