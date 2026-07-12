import "./feedTabs.css";

export default function FeedTabs({ activeTab, setActiveTab }) {
  return (
    <nav className="feed-tabs">
      <button
        className={
          activeTab === "feed" ? "feed-tabs__item active" : "feed-tabs__item"
        }
        onClick={() => setActiveTab("feed")}
      >
        Feed
      </button>
      <button
        className={
          activeTab === "editorials"
            ? "feed-tabs__item active"
            : "feed-tabs__item"
        }
        onClick={() => setActiveTab("editorials")}
      >
        Editorials
      </button>
    </nav>
  );
}
