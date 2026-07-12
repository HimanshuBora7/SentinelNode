import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, Link } from "react-router-dom";

export default function Contribute() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !authorName || !authorEmail) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/articles/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content_html: content,
          author_name: authorName,
          author_email: authorEmail,
        }),
      });

      if (!response.ok) throw new Error("Submission failed");

      setStatus("success");
      setTimeout(() => navigate("/"), 4000);
    } catch (err) {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        style={{
          padding: "40px 24px",
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1 style={{ color: "var(--success)", fontFamily: "var(--font-mono)" }}>
          Transmission Sent.
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 16 }}>
          Your analysis has been securely emailed.
        </p>
        <p style={{ color: "var(--text-secondary)" }}>
          Redirecting to secure feed...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: 800,
        margin: "0 auto",
        paddingBottom: 120,
      }}
    >
      <Link
        to="/"
        style={{
          color: "var(--accent)",
          textDecoration: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          marginBottom: 24,
          display: "inline-block",
        }}
      >
        ← ABORT TRANSMISSION
      </Link>

      <h1
        style={{
          margin: "0 0 24px 0",
          fontSize: "1.8rem",
          color: "var(--text-primary)",
        }}
      >
        Contribute
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
      >
        <input
          type="text"
          placeholder="Article Headline"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: "16px",
            fontSize: "1.2rem",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            borderRadius: "8px",
          }}
        />

        <div
          style={{
            background: "#fff",
            color: "#000",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            placeholder="Write your analysis here..."
            style={{ height: "400px" }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          <input
            type="text"
            placeholder="Analyst Name / Callsign"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            style={{
              padding: "12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "8px",
            }}
          />
          <input
            type="email"
            placeholder="Secure Email Address"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            style={{
              padding: "12px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              borderRadius: "8px",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          style={{
            padding: "16px",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: status === "submitting" ? "not-allowed" : "pointer",
            marginTop: "12px",
            fontFamily: "var(--font-mono)",
          }}
        >
          {status === "submitting"
            ? "ENCRYPTING & SENDING..."
            : "SUBMIT FOR REVIEW"}
        </button>

        {status === "error" && (
          <p
            style={{
              color: "var(--danger)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
            }}
          >
            Transmission Failed..
          </p>
        )}
      </form>
    </div>
  );
}
