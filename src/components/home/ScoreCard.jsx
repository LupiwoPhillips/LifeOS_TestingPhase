import React from "react";
import LifeScoreRing from "../LifeScoreRing";
import { useAnimatedNumber } from "../../hooks/useAnimatedNumber";

export default function ScoreCard({ metrics, previousScore, reason }) {
  // Hooks must run unconditionally, so compute a safe fallback score even
  // when metrics hasn't loaded yet, and bail out of rendering afterward.
  const score = metrics?.overall_score ?? 0;
  const animatedScore = useAnimatedNumber(score);

  if (!metrics) return null;

  const delta =
    typeof previousScore === "number" ? score - previousScore : null;

  return (
    <section className="card score-card">
      <LifeScoreRing score={animatedScore} />
      <div className="score-text">
        <span className="score-label">Life Score</span>
        <span className="score-value">{animatedScore}%</span>

        {delta !== null && delta !== 0 && (
          <span className={`score-delta ${delta > 0 ? "up" : "down"}`}>
            {delta > 0 ? "▲" : "▼"} {Math.abs(delta)} since last update
          </span>
        )}

        {reason && <span className="score-hint">{reason}</span>}
      </div>
    </section>
  );
}
