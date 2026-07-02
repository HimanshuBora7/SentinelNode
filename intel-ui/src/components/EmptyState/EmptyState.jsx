import "./EmptyState.css";

import { Radar } from "lucide-react";

export default function EmptyState() {
  return (
    <section className="empty-state">
      <Radar size={52} strokeWidth={1.5} className="empty-state__icon" />

      <h2 className="empty-state__title">Intelligence Feed</h2>

      <p className="empty-state__description">
        No reports available yet.
        <br />
        New intelligence will appear automatically.
      </p>
    </section>
  );
}
