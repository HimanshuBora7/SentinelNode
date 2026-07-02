import "../styles/Home.css";
import Header from "../components/Header/Header";
import FeedTabs from "../components/FeedTabs/FeedTabs";
import EmptyState from "../components/EmptyState/EmptyState";
import BottomNav from "../components/BottomNav/BottomNav";
import IntelligenceCard from "../components/IntelligenceCard";
export default function Home() {
  return (
    <div className="home">
      <Header />
      <FeedTabs />

      <main className="home__content">
        <IntelligenceCard />
      </main>

      <BottomNav />
    </div>
  );
}
