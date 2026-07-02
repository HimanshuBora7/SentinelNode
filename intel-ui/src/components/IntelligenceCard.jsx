import "../styles/IntelligenceCard.css";

export default function IntelligenceCard() {
  return (
    <article className="intel-card">
      <article className="intel-card">
        <div className="intel-card__classification">
          <span className="intel-card__category">CYBER OPERATIONS</span>
          <span className="intel-card__priority">P1</span>
        </div>

        <h2 className="intel-card__title">
          Coordinated phishing campaign targets university email accounts
        </h2>

        <p className="intel-card__summary">
          Multiple institutions reported credential harvesting attempts through
          spoofed Outlook login pages. Activity increased during the last 24
          hours.
        </p>

        <div className="intel-card__meta">
          <div className="meta-item">
            <span className="meta-label">Confidence</span>
            <span className="meta-value">92%</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Source</span>
            <span className="meta-value">CERT-In</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Updated</span>
            <span className="meta-value">3 min ago</span>
          </div>
        </div>
      </article>
    </article>
  );
}
