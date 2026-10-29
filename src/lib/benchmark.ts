// The published benchmark: the Observer.ai prototype run of October 2026.
// Every number on the site that claims accuracy or cost comes from here.

// Failures found in the 5% of traces a team reviews, 1 in 10 traces wrong.
export const recall = [
  { name: "Perfect reviewer", found: 11, normalized: 100 },
  { name: "Jev, the default model", found: 8.4, normalized: 74, us: true },
  { name: "Six simple rules", found: 6.9, normalized: 59 },
  { name: "Random sampling", found: 1.1, normalized: 0 },
] as const;

// How often each method rates a wrong trace above a right one.
export const auroc = [
  { name: "Jev", value: 81, us: true },
  { name: "Kev", value: 74 },
  { name: "Laya", value: 72 },
  { name: "Six simple rules", value: 70 },
  { name: "Coin flip", value: 50 },
] as const;

export const multiple = Math.round((8.4 / 1.1) * 10) / 10; // 7.6

export const dataset = {
  questions: "HotpotQA: public questions that each need two Wikipedia facts, with known answers",
  agent: "A ReAct agent (think, search, read, repeat) on Google ADK, with some runs given planted failures",
  runs: "4,499 runs from 3,000 questions, each labelled right or wrong against the known answer",
  heldOut: "456 held-out test traces, resampled 20 times so 1 in 10 is wrong",
  question: "Jev scored on its answer_wrong question alone",
};

// Jev usage on 13 Oct 2026: 901 requests, 694,807 input and 45,050 output
// tokens, $0.03 billed (rounded to the cent).
export const cost = {
  traces: 901,
  tokens: 694_807 + 45_050,
  dollars: 0.03,
  tokensPerTrace: 820,
};
export const dollarsPerToken = cost.dollars / cost.tokens;
