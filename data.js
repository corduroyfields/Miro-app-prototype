// Demo content for the Livable prototype.
// All city attribute values are illustrative only — not real statistics.
// Attributes are on a 0–10 scale unless noted. For costOfLiving, 10 = most affordable.

export const DISQUALIFIERS = [
  {
    id: "noHarshWinters",
    label: "No harsh winters",
    detail: "Remove places with long, severe winters (heavy snow, deep cold).",
    test: (city) => city.winterSeverity <= 6,
    reason: "winters are too severe",
  },
  {
    id: "noExtremeHeat",
    label: "No extreme heat or humidity",
    detail: "Remove places with brutal summers.",
    test: (city) => city.summerHeat <= 6,
    reason: "summers are too hot or humid",
  },
  {
    id: "coastalAccess",
    label: "Ocean within a day trip",
    detail: "Keep only places within easy driving distance of a coast.",
    test: (city) => city.nearCoast,
    reason: "too far from the coast",
  },
];

export const METRO_SIZE_OPTIONS = [
  { id: "any", label: "Any size", min: 0 },
  { id: "mid", label: "At least mid-size (250k+ metro)", min: 250_000 },
  { id: "large", label: "Large metro only (1M+)", min: 1_000_000 },
];

export const QUIZ_QUESTIONS = [
  {
    id: "weekend",
    text: "What does your ideal Saturday look like?",
    help: "This shapes how much weight we give to outdoor access vs. cultural amenities. There's no wrong answer — pick what you'd actually do most often.",
    options: [
      { id: "trail", label: "On a trail, in a kayak, or up a mountain", boosts: { outdoors: 2 } },
      { id: "museum", label: "Museums, live music, a new restaurant", boosts: { culture: 2 } },
      { id: "neighborhood", label: "Walking my neighborhood, coffee in hand", boosts: { walkability: 2 } },
      { id: "home", label: "A quiet day at home with space to spread out", boosts: { costOfLiving: 1, safety: 1 } },
    ],
  },
  {
    id: "climate",
    text: "Which climate sounds best?",
    help: "We score every place on how mild its climate is plus winter and summer extremes. 'No strong preference' keeps climate neutral in your match.",
    options: [
      { id: "seasons", label: "Four real seasons, snow included", boosts: { climate: 1 } },
      { id: "warm", label: "Warm pretty much year-round", boosts: { climate: 2 } },
      { id: "mild", label: "Mild and dry — never too hot, never too cold", boosts: { climate: 2 } },
      { id: "whatever", label: "No strong preference", boosts: {} },
    ],
  },
  {
    id: "energy",
    text: "How much city do you want?",
    help: "Bigger metros tend to score higher on jobs and culture, smaller ones on cost and safety. This tunes that trade-off.",
    options: [
      { id: "big", label: "Big-city energy — the more going on, the better", boosts: { culture: 1, jobMarket: 1 } },
      { id: "mid", label: "Mid-size — options without the chaos", boosts: { walkability: 1, costOfLiving: 1 } },
      { id: "small", label: "Small and calm — I'll trade buzz for breathing room", boosts: { costOfLiving: 1, safety: 1, outdoors: 1 } },
    ],
  },
  {
    id: "work",
    text: "What's your work situation?",
    help: "If you work remotely, the local job market matters less and affordability matters more.",
    options: [
      { id: "remote", label: "Fully remote — I can live anywhere", boosts: { costOfLiving: 2 } },
      { id: "local", label: "I'll need a job locally", boosts: { jobMarket: 2 } },
      { id: "hybrid", label: "Hybrid — near a real job market, but flexible", boosts: { jobMarket: 1 } },
    ],
  },
  {
    id: "housing",
    text: "When it comes to housing, you'd rather have…",
    help: "This is the classic space-vs-location trade-off. It nudges affordability against walkability in your match score.",
    options: [
      { id: "space", label: "More house and yard for the money", boosts: { costOfLiving: 2 } },
      { id: "location", label: "Less space, but walkable to everything", boosts: { walkability: 2 } },
      { id: "balance", label: "A balance of both", boosts: { costOfLiving: 1, walkability: 1 } },
    ],
  },
  {
    id: "community",
    text: "Who do you picture as your neighbors?",
    help: "A rough proxy for community fit. Family-oriented picks weight schools and safety; younger scenes weight culture and jobs.",
    options: [
      { id: "families", label: "Families with kids, good schools nearby", boosts: { schools: 2, safety: 1 } },
      { id: "young", label: "Young professionals and a social scene", boosts: { culture: 1, jobMarket: 1 } },
      { id: "mixed", label: "A real mix of ages and backgrounds", boosts: { culture: 1 } },
      { id: "quiet", label: "Quiet, settled, low-key", boosts: { safety: 2 } },
    ],
  },
];

export const FACTORS = [
  { id: "costOfLiving", label: "Cost of living", help: "Housing, taxes, day-to-day expenses. Higher score = more affordable." },
  { id: "jobMarket", label: "Job market", help: "Strength and breadth of local employment." },
  { id: "climate", label: "Climate", help: "Overall mildness — fewer weather extremes scores higher." },
  { id: "safety", label: "Safety", help: "Relative crime and overall sense of security." },
  { id: "outdoors", label: "Outdoor access", help: "Parks, trails, water, mountains within reach." },
  { id: "culture", label: "Culture & food", help: "Arts, music, restaurants, things to do." },
  { id: "schools", label: "Schools", help: "Quality of local public schools." },
  { id: "walkability", label: "Walkability", help: "How much of daily life works without a car." },
];

// Sample candidate set. Values are demo placeholders on a 0–10 scale.
export const CITIES = [
  { zip: "78704", city: "Austin", state: "TX", metroPop: 2_400_000, nearCoast: false, winterSeverity: 1, summerHeat: 9, costOfLiving: 4, jobMarket: 9, climate: 5, safety: 6, outdoors: 6, culture: 9, schools: 6, walkability: 5 },
  { zip: "27701", city: "Durham", state: "NC", metroPop: 650_000, nearCoast: true, winterSeverity: 2, summerHeat: 7, costOfLiving: 6, jobMarket: 8, climate: 6, safety: 5, outdoors: 6, culture: 7, schools: 7, walkability: 4 },
  { zip: "80205", city: "Denver", state: "CO", metroPop: 3_000_000, nearCoast: false, winterSeverity: 5, summerHeat: 4, costOfLiving: 4, jobMarket: 8, climate: 6, safety: 5, outdoors: 10, culture: 7, schools: 6, walkability: 5 },
  { zip: "55406", city: "Minneapolis", state: "MN", metroPop: 3_700_000, nearCoast: false, winterSeverity: 9, summerHeat: 4, costOfLiving: 6, jobMarket: 7, climate: 3, safety: 5, outdoors: 7, culture: 7, schools: 7, walkability: 6 },
  { zip: "97214", city: "Portland", state: "OR", metroPop: 2_500_000, nearCoast: true, winterSeverity: 3, summerHeat: 3, costOfLiving: 4, jobMarket: 6, climate: 7, safety: 4, outdoors: 9, culture: 8, schools: 6, walkability: 7 },
  { zip: "37206", city: "Nashville", state: "TN", metroPop: 2_100_000, nearCoast: false, winterSeverity: 2, summerHeat: 7, costOfLiving: 5, jobMarket: 8, climate: 6, safety: 5, outdoors: 5, culture: 9, schools: 5, walkability: 4 },
  { zip: "53703", city: "Madison", state: "WI", metroPop: 700_000, nearCoast: false, winterSeverity: 9, summerHeat: 4, costOfLiving: 6, jobMarket: 7, climate: 3, safety: 7, outdoors: 7, culture: 6, schools: 8, walkability: 6 },
  { zip: "29403", city: "Charleston", state: "SC", metroPop: 850_000, nearCoast: true, winterSeverity: 1, summerHeat: 8, costOfLiving: 5, jobMarket: 6, climate: 6, safety: 5, outdoors: 7, culture: 8, schools: 5, walkability: 6 },
  { zip: "84103", city: "Salt Lake City", state: "UT", metroPop: 1_300_000, nearCoast: false, winterSeverity: 6, summerHeat: 5, costOfLiving: 5, jobMarket: 8, climate: 5, safety: 6, outdoors: 10, culture: 6, schools: 6, walkability: 5 },
  { zip: "15217", city: "Pittsburgh", state: "PA", metroPop: 2_300_000, nearCoast: false, winterSeverity: 6, summerHeat: 4, costOfLiving: 8, jobMarket: 6, climate: 4, safety: 6, outdoors: 6, culture: 7, schools: 7, walkability: 6 },
  { zip: "85716", city: "Tucson", state: "AZ", metroPop: 1_100_000, nearCoast: false, winterSeverity: 0, summerHeat: 9, costOfLiving: 7, jobMarket: 5, climate: 5, safety: 4, outdoors: 8, culture: 6, schools: 5, walkability: 4 },
  { zip: "23220", city: "Richmond", state: "VA", metroPop: 1_300_000, nearCoast: true, winterSeverity: 3, summerHeat: 6, costOfLiving: 6, jobMarket: 7, climate: 6, safety: 5, outdoors: 6, culture: 7, schools: 6, walkability: 5 },
  { zip: "48104", city: "Ann Arbor", state: "MI", metroPop: 370_000, nearCoast: false, winterSeverity: 7, summerHeat: 4, costOfLiving: 5, jobMarket: 7, climate: 4, safety: 7, outdoors: 6, culture: 7, schools: 9, walkability: 7 },
  { zip: "87106", city: "Albuquerque", state: "NM", metroPop: 920_000, nearCoast: false, winterSeverity: 2, summerHeat: 6, costOfLiving: 7, jobMarket: 5, climate: 7, safety: 3, outdoors: 8, culture: 6, schools: 4, walkability: 4 },
  { zip: "04101", city: "Portland", state: "ME", metroPop: 550_000, nearCoast: true, winterSeverity: 8, summerHeat: 2, costOfLiving: 5, jobMarket: 5, climate: 4, safety: 8, outdoors: 8, culture: 7, schools: 7, walkability: 7 },
  { zip: "93101", city: "Santa Barbara", state: "CA", metroPop: 450_000, nearCoast: true, winterSeverity: 0, summerHeat: 2, costOfLiving: 1, jobMarket: 5, climate: 10, safety: 6, outdoors: 9, culture: 7, schools: 7, walkability: 6 },
  { zip: "66044", city: "Lawrence", state: "KS", metroPop: 120_000, nearCoast: false, winterSeverity: 5, summerHeat: 7, costOfLiving: 8, jobMarket: 4, climate: 4, safety: 6, outdoors: 4, culture: 6, schools: 7, walkability: 5 },
  { zip: "32601", city: "Gainesville", state: "FL", metroPop: 340_000, nearCoast: true, winterSeverity: 0, summerHeat: 9, costOfLiving: 7, jobMarket: 5, climate: 5, safety: 4, outdoors: 7, culture: 5, schools: 6, walkability: 4 },
  { zip: "59801", city: "Missoula", state: "MT", metroPop: 120_000, nearCoast: false, winterSeverity: 7, summerHeat: 3, costOfLiving: 5, jobMarket: 4, climate: 4, safety: 7, outdoors: 10, culture: 6, schools: 6, walkability: 5 },
  { zip: "01060", city: "Northampton", state: "MA", metroPop: 160_000, nearCoast: false, winterSeverity: 7, summerHeat: 3, costOfLiving: 4, jobMarket: 5, climate: 4, safety: 8, outdoors: 7, culture: 8, schools: 8, walkability: 7 },
];
