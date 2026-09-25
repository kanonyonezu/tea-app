const BREW_GUIDES = [
  {
    keyword: "green",
    text: "Use water around 75–80°C, not boiling. Steep 1 teaspoon of leaves per cup for 2–3 minutes. Hotter water or a longer steep makes it bitter.",
  },
  {
    keyword: "white",
    text: "Use water around 80–85°C. Steep 2 teaspoons of leaves per cup for 4–5 minutes. It is gentle, so you can steep it a little longer if you like.",
  },
  {
    keyword: "yellow",
    text: "Use water around 75–80°C. Steep 1 teaspoon of leaves per cup for 2–3 minutes.",
  },
  {
    keyword: "oolong",
    text: "Use water around 85–95°C. Steep 1 teaspoon of leaves per cup for 3–5 minutes. Good oolong can be steeped several times.",
  },
  {
    keyword: "black",
    text: "Use freshly boiled water. Steep 1 teaspoon of leaves per cup for 3–5 minutes. Add milk or sugar if you like.",
  },
  {
    keyword: "dark",
    text: "Rinse the leaves with boiling water first and pour it away. Then steep in boiling water for 2–4 minutes. It can be steeped many times.",
  },
  {
    keyword: "herbal",
    text: "Use freshly boiled water. Steep for 5–7 minutes. Herbal teas do not get bitter, so a longer steep is fine.",
  },
];

const DEFAULT_BREW_GUIDE =
  "Use water around 85°C. Steep 1 teaspoon of leaves per cup for about 3 minutes, then taste and adjust.";

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function flavorText(tea) {
  if (!tea.flavor_primary) {
    return "";
  }
  return tea.flavor_primary
    .split(",")
    .map((word) => word.trim())
    .filter((word) => word !== "")
    .map(capitalize)
    .join(", ");
}

export function brewGuide(tea) {
  const categories = (tea.category || []).join(" ").toLowerCase();
  const guide = BREW_GUIDES.find((item) => categories.includes(item.keyword));
  return guide ? guide.text : DEFAULT_BREW_GUIDE;
}
