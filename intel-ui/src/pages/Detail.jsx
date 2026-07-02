import { useParams } from "react-router-dom";
import { posts } from "../data/dummy";

export default function Detail() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === Number(id));

  if (!post) return <div>Not found</div>;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ color: "#8B949E", fontSize: 12 }}>
        {post.category} • {post.importance}
      </div>

      <h2>{post.summary}</h2>

      <p style={{ color: "#E6EDF3", lineHeight: 1.6 }}>
        This is where full intelligence report will appear. Later this will come
        from your LLM + database summary field.
      </p>

      <div style={{ marginTop: 20, color: "#8B949E" }}>
        Confidence: {Math.round(post.confidence * 100)}%
        <br />
        Similarity: {Math.round(post.similarity * 100)}%
      </div>
    </div>
  );
}
