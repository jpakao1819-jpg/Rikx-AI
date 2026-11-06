const weeks = [
  { title: "Forex market basics", phase: "FOUNDATIONS", goal: "Understand what is traded and how currency prices are quoted.", lessons: ["Learn base and quote currencies, major/minor pairs, pips, lots, and leverage.", "Compare spot forex with exchange-traded currency products; market structure varies by provider and jurisdiction."], practice: "Explain a sample EUR/USD quote and calculate a hypothetical pip value and notional size.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "How the market works", phase: "FOUNDATIONS", goal: "Learn about participants, sessions, liquidity, and execution.", lessons: ["Study the roles of banks, businesses, funds, dealers, and retail providers.", "Learn bid, ask, spread, market and limit orders, and slippage."], practice: "Compare timestamped demo bid/ask quotes at different times. Record observations; do not place a trade.", sources: ["BIS Triennial Survey", "CME Group Education"] },
  { title: "Leverage and risk", phase: "FOUNDATIONS", goal: "Recognize how leverage magnifies both gains and losses.", lessons: ["Work through hypothetical margin, position-size, and pip-value calculations.", "Study gap, liquidity, counterparty, and provider risks; a stop order may not guarantee an exit price."], practice: "Write a risk checklist and calculate hypothetical loss scenarios for different position sizes.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "Economic fundamentals", phase: "FOUNDATIONS", goal: "Connect currencies to economic data and policy without assuming simple cause and effect.", lessons: ["Review inflation, employment, growth, interest rates, and central-bank communications.", "Use primary sources; distinguish a release's actual value, expectations, and revisions."], practice: "Summarize an official policy statement and two relevant economic indicators for one currency.", sources: ["Federal Reserve Monetary Policy", "BIS Triennial Survey"] },
  { title: "Reading charts thoughtfully", phase: "ANALYSIS & RISK", goal: "Read charts without treating patterns as certainty.", lessons: ["Learn candlesticks, timeframes, trend, range, support, and resistance as descriptive tools.", "Understand that indicators transform price data and may lag or give false signals."], practice: "Annotate three historical charts using only information available at each timestamp.", sources: ["CME Group Education"] },
  { title: "Build a testable hypothesis", phase: "ANALYSIS & RISK", goal: "Turn vague opinions into specific, falsifiable rules.", lessons: ["Define market, timeframe, entry condition, invalidation, exit, and when not to trade.", "Separate observation from interpretation and record assumptions before reviewing outcomes."], practice: "Write one simple hypothetical strategy with unambiguous rules. No live orders or profit claims.", sources: ["CME Group Education"] },
  { title: "Position sizing and guardrails", phase: "ANALYSIS & RISK", goal: "Make risk limits independent of confidence in a prediction.", lessons: ["Study potential loss, drawdown, correlated exposure, and daily stop rules.", "Understand that sizing and stop-losses cannot eliminate market or execution risk."], practice: "Create a paper-only risk plan with a hypothetical maximum loss and stop-for-the-day rule.", sources: ["NFA Investor Resources", "CFTC Learn & Protect"] },
  { title: "Trading psychology and process", phase: "ANALYSIS & RISK", goal: "Develop repeatable decision habits and recognize cognitive biases.", lessons: ["Study overconfidence, loss aversion, confirmation bias, and revenge trading.", "Create a pre-analysis checklist and define conditions for standing aside."], practice: "Review five historical scenarios and journal uncertainties and possible biases.", sources: ["CME Group Education"] },
  { title: "Backtesting without fooling yourself", phase: "PRACTICE & REVIEW", goal: "Learn what historical tests can and cannot tell you.", lessons: ["Use chronological training and test periods; avoid look-ahead bias.", "Include realistic spreads, fees, slippage, missing data, and varied market conditions."], practice: "Write a test protocol and reserve unseen data before tuning any rules.", sources: ["BIS Triennial Survey", "CME Group Education"] },
  { title: "Evaluate evidence", phase: "PRACTICE & REVIEW", goal: "Assess performance with more than a win rate.", lessons: ["Review after-cost expectancy, drawdown, sample size, and performance across regimes.", "Check probability calibration and compare model ideas against simple baselines."], practice: "Design a timestamped signal log that records confidence before outcomes are known.", sources: ["CME Group Education"] },
  { title: "Paper-trading simulation", phase: "PRACTICE & REVIEW", goal: "Practice following written rules without risking money.", lessons: ["Use simulated funds or a spreadsheet with timestamped prices and hypothetical costs.", "Record rule changes and avoid changing rules mid-test without starting a new evaluation."], practice: "Log hypothetical setups—or explicitly record 'no trade' when rules are not met. Practice is not proof of an edge.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "Review and next steps", phase: "PRACTICE & REVIEW", goal: "Summarize learning, gaps, and a responsible next research plan.", lessons: ["Review your journal for data quality, rule-following, errors, and emotional patterns.", "Write what evidence would change your mind and identify topics for further study."], practice: "Prepare a report with sources, methodology, costs, results, uncertainties, and lessons. Do not treat a short simulation as evidence of future profits.", sources: ["All program sources"] }
];

const STORAGE_KEY = "rikx-learning-program-v1";
const weekList = document.querySelector("#week-list");
const progressCount = document.querySelector("#completed-count");
const progressFill = document.querySelector("#progress-fill");
const progressBar = document.querySelector("#progress-bar");
const progressHint = document.querySelector("#progress-hint");

function loadProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

const completedWeeks = new Set(loadProgress().filter((week) => Number.isInteger(week) && week >= 0 && week < weeks.length));

function render() {
  weekList.replaceChildren();
  const nextWeek = weeks.findIndex((_, index) => !completedWeeks.has(index));

  weeks.forEach((week, index) => {
    const card = document.createElement("article");
    card.className = `week-card${completedWeeks.has(index) ? " is-complete" : ""}`;
    const details = document.createElement("details");
    details.open = index === nextWeek;
    const summary = document.createElement("summary");
    summary.className = "week-summary";
    const number = document.createElement("span");
    number.className = "week-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const titleWrap = document.createElement("span");
    titleWrap.className = "week-title-wrap";
    const phase = document.createElement("span");
    phase.className = "week-phase";
    phase.textContent = week.phase;
    const title = document.createElement("strong");
    title.textContent = week.title;
    titleWrap.append(phase, title);
    const icon = document.createElement("span");
    icon.className = "chevron";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "+";
    summary.append(number, titleWrap, icon);

    const content = document.createElement("div");
    content.className = "week-content";
    const goal = document.createElement("p");
    goal.className = "week-goal";
    goal.textContent = week.goal;
    content.append(goal);
    appendList(content, "Study", week.lessons);
    const practiceHeading = document.createElement("h3");
    practiceHeading.textContent = "Practice";
    const practice = document.createElement("p");
    practice.textContent = week.practice;
    const sourceHeading = document.createElement("h3");
    sourceHeading.textContent = "Suggested sources";
    const sourceList = document.createElement("p");
    sourceList.className = "source-tags";
    sourceList.textContent = week.sources.join(" · ");
    content.append(practiceHeading, practice, sourceHeading, sourceList);

    const label = document.createElement("label");
    label.className = "complete-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completedWeeks.has(index);
    checkbox.setAttribute("aria-label", `Mark week ${index + 1} complete`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) completedWeeks.add(index);
      else completedWeeks.delete(index);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedWeeks]));
      } catch {
        progressHint.textContent = "Progress could not be saved in this browser, but you can still use the program.";
      }
      render();
    });
    const labelText = document.createElement("span");
    labelText.textContent = "Mark this week complete";
    label.append(checkbox, labelText);
    content.append(label);
    details.append(summary, content);
    card.append(details);
    weekList.append(card);
  });

  const count = completedWeeks.size;
  progressCount.textContent = String(count);
  progressFill.style.width = `${(count / weeks.length) * 100}%`;
  progressBar.setAttribute("aria-valuenow", String(count));
  progressHint.textContent = count === weeks.length
    ? "Program complete. Review your journal; completion does not demonstrate a profitable strategy."
    : count === 0
      ? "Start with Week 1. Mark a week complete after its study and practice."
      : `${weeks.length - count} ${weeks.length - count === 1 ? "week" : "weeks"} remaining. Progress is saved locally in this browser.`;
}

function appendList(parent, headingText, items) {
  const heading = document.createElement("h3");
  heading.textContent = headingText;
  const list = document.createElement("ul");
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.append(li);
  });
  parent.append(heading, list);
}

render();
