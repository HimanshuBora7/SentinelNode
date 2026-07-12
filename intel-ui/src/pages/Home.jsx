import { useState, useEffect } from "react";
import "../styles/Home.css";
import Header from "../components/Header/Header";
import FeedTabs from "../components/FeedTabs/FeedTabs";
import EmptyState from "../components/EmptyState/EmptyState";
import BottomNav from "../components/BottomNav/BottomNav";
import IntelligenceCard from "../components/IntelligenceCard";
import RightSidebar from "../components/RightSidebar/RightSidebar";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("feed"); // <-- New state!

  useEffect(() => {
    setLoading(true);
    fetch(`/api/feed`)
      .then((res) => {
        if (!res.ok) throw new Error("API request failed");
        return res.json();
      })
      .then((data) => {
        setPosts(data.posts);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="home">
      <Header />
      {/* Pass the state to the tabs */}
      <FeedTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="home__content">
        {/* If we are on the Editorials tab, show the coming soon message */}
        {activeTab === "editorials" ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <h2
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                marginBottom: "16px",
              }}
            >
              EDITORIALS COMING SOON
            </h2>
          </div>
        ) : (
          /* Otherwise, render the normal feed */
          <>
            {loading && <EmptyState />}
            {error && <EmptyState />}
            {!loading && !error && posts.length === 0 && <EmptyState />}
            {!loading &&
              !error &&
              posts.map((post) => (
                <IntelligenceCard key={post.id} post={post} />
              ))}
          </>
        )}
      </main>

      <BottomNav />
      <div className="desktop-only">
        <RightSidebar />
      </div>
    </div>
  );
}
