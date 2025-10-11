import {
  carMakes,
  fuelTypes,
  transmissions,
  engineTypes,
  locations,
  states,
} from "./data.js";

// --- NEW HELPER FUNCTION FOR FUZZY/PHRASE MATCHING (Added to top of file) ---
// This function checks if any phrase of 1, 2, or 3 tokens matches a target list.
const findFuzzyMatch = (tokens, targetList) => {
  if (!tokens || tokens.length === 0) return null;

  const lowerTargetList = targetList.map((item) => ({
    original: item,
    normalized: item.toLowerCase().replace(/[^a-z0-9]/g, ""),
  }));

  for (let i = 0; i < tokens.length; i++) {
    for (let j = 1; j <= 3; j++) {
      if (i + j > tokens.length) continue;

      const phraseTokens = tokens.slice(i, i + j);
      const phrase = phraseTokens.join(" ");
      const normalizedPhrase = phrase.replace(/[^a-z0-9]/g, "");

      // 1. Exact phrase match
      const exactMatch = lowerTargetList.find(
        (item) => item.original.toLowerCase() === phrase
      );
      if (exactMatch) {
        return { matched: exactMatch.original, usedPhrase: phrase };
      }

      // 2. Lenient match
      const lenientMatch = lowerTargetList.find(
        (item) =>
          item.normalized.startsWith(normalizedPhrase) ||
          normalizedPhrase.includes(item.normalized) ||
          item.normalized === normalizedPhrase
      );

      if (lenientMatch) {
        return { matched: lenientMatch.original, usedPhrase: phrase };
      }
    }
  }

  return null;
};

export const parseSearchQuery = (query) => {
  if (!query) return {};

  // Normalize the query string before splitting (replace hyphens/dots with spaces)
  const normalizedQuery = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");
  const tokens = normalizedQuery.split(/\s+/).filter((t) => t);

  const parsedFilters = { unmatched: [] };

  // Combine all data sources into a single array of items for easier processing later
  // We don't need the Sets anymore, as we're using the centralized findFuzzyMatch helper.
  const allFilters = [
    { key: "make", list: carMakes },
    { key: "fuelType", list: fuelTypes },
    { key: "transmission", list: transmissions },
    { key: "state", list: states },
    { key: "location", list: locations },
    { key: "engineType", list: engineTypes },
  ];

  const usedTokens = new Set();

  // let remainingTokens = [...tokens];
  // let consumedIndices = new Set();

  // 1️⃣ Fuzzy match known filters
  for (const { key, list } of allFilters) {
    if (parsedFilters[key]) continue; // Skip if this filter key is already filled

    const result = findFuzzyMatch(tokens, list);

    if (result) {
      parsedFilters[key] = result.matched;
      const matchTokens = result.usedPhrase.toLowerCase().split(" ");
      matchTokens.forEach((t) => usedTokens.add(t));
    }
  }

  // 2️⃣ Detect numeric years (single year = min & max)
  for (const token of tokens) {
    // Check for Year (e.g., 2015) - Only checks 4-digit numbers that start with 1 or 2
    if (token.match(/^(19|20)\d{2}$/)) {
      parsedFilters.minYear = parsedFilters.minYear || token;
      parsedFilters.maxYear = parsedFilters.maxYear || token;
      usedTokens.add(token);
    }
  }

  for (const token of tokens) {
    if (!usedTokens.has(token)) {
      parsedFilters.unmatched.push(token);
    }
  }

  // console.log(parsedFilters);

  return parsedFilters;
};

parseSearchQuery("a");
