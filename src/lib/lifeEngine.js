export function calculateLifeImpact(checkIn) {
  const impact = {
    mental: 0,
    spiritual: 0,
    fitness: 0,
    career: 0,
    finance: 0,
    relationships: 0,
  }

  // Mood
  impact.mental += checkIn.mood_score

  // Energy
  if (checkIn.energy >= 70) {
    impact.fitness += 2
    impact.mental += 1
  }

  // Stress
  if (checkIn.stress <= 30) {
    impact.mental += 2
  } else if (checkIn.stress >= 70) {
    impact.mental -= 2
  }

  // Gratitude
  if (checkIn.gratitude.length > 0) {
    impact.spiritual += 2
    impact.mental += 1
  }

  return impact
}