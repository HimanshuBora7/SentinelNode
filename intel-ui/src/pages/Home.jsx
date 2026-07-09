import { useState, useEffect } from "react";
import "../styles/Home.css";
import Header from "../components/Header/Header";
import FeedTabs from "../components/FeedTabs/FeedTabs";
import EmptyState from "../components/EmptyState/EmptyState";
import BottomNav from "../components/BottomNav/BottomNav";
import IntelligenceCard from "../components/IntelligenceCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <FeedTabs />

      <main className="home__content">
        {loading && <EmptyState />}
        {error && <EmptyState />}
        {!loading && !error && posts.length === 0 && <EmptyState />}
        {!loading &&
          !error &&
          posts.map((post) => (
            <IntelligenceCard key={post.id} post={post} />
          ))}
      </main>

      <BottomNav />
    </div>
  );
}
