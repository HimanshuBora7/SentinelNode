import "./feedTabs.css";

export default function FeedTabs() {
  return (
    <nav className="feed-tabs">
      <button className="feed-tabs__item active">Feed</button>

      <button className="feed-tabs__item">Editorials</button>
    </nav>
  );
}
