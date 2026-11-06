const weeks = [
  { title: "Forex market basics", phase: "FOUNDATIONS", goal: "Understand what is traded and how currency prices are quoted.", lessons: ["Learn base and quote currencies, major/minor pairs, pips, lots, and leverage.", "Compare spot forex with exchange-traded currency products; market structure varies by provider and jurisdiction."], practice: "Explain a sample EUR/USD quote and calculate a hypothetical pip value and notional size.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "How the market works", phase: "FOUNDATIONS", goal: "Learn about participants, sessions, liquidity, and execution.", lessons: ["Study the roles of banks, businesses, funds, dealers, and retail providers.", "Learn bid, ask, spread, market and limit orders, and slippage."], practice: "Compare timestamped demo bid/ask quotes at different times. Record observations; do not place a trade.", sources: ["BIS Triennial Survey", "CME Group Education"] },
  { title: "Leverage and risk", phase: "FOUNDATIONS", goal: "Recognize how leverage magnifies both gains and losses.", lessons: ["Work through hypothetical margin, position-size, and pip-value calculations.", "Study gap, liquidity, counterparty, and provider risks; a stop order may not guarantee an exit price."], practice: "Write a risk checklist and calculate hypothetical loss scenarios for different position sizes.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "Economic fundamentals", phase: "FOUNDATIONS", goal: "Connect currencies to economic data and policy without assuming simple cause and effect.", lessons: ["Review inflation, employment, growth, interest rates, and central-bank communications.", "Use primary sources; distinguish a release's actual value, expectations, and revisions."], practice: "Summarize an official policy statement and two relevant economic indicators for one currency.", sources: ["Federal Reserve Monetary Policy", "BIS Triennial Survey"] },
  { title: "Reading charts thoughtfully", phase: "ANALYSIS & RISK", goal: "Read charts without treating patterns as certainty.", lessons: ["Learn candlesticks, timeframes, trend, range, support, and resistance as descriptive tools.", "Understand that indicators transform price data and may lag or give false signals."], practice: "Annotate three historical charts using only information available at each timestamp.", sources: ["CME Group Education"] },
  { title: "Build a testable hypothesis", phase: "ANALYSIS & RISK", goal: "Turn vague opinions into specific, falsifiable rules.", lessons: ["Define market, timeframe, entry condition, invalidation, exit, and when not to trade.", "Separate observation from interpretation and record assumptions before reviewing outcomes."], practice: "Write one simple hypothesis strategy with unambiguous rules. No live orders or profit claims.", sources: ["CME Group Education"] },
  { title: "Position sizing and guardrails", phase: "ANALYSIS & RISK", goal: "Make risk limits independent of confidence in a prediction.", lessons: ["Study potential loss, drawdown, correlated exposure, and daily stop rules.", "Understand that sizing and stop-losses cannot eliminate market or execution risk."], practice: "Create a paper-only risk plan with a hypothetical maximum loss and stop-for-the-day rule.", sources: ["NFA Investor Resources", "CFTC Learn & Protect"] },
  { title: "Trading psychology and process", phase: "ANALYSIS & RISK", goal: "Develop repeatable decision habits and recognize cognitive biases.", lessons: ["Study overconfidence, loss aversion, confirmation bias, and revenge trading.", "Create a pre-analysis checklist and define conditions for standing aside."], practice: "Review five historical scenarios and journal uncertainties and possible biases.", sources: ["CME Group Education"] },
  { title: "Backtesting without fooling yourself", phase: "PRACTICE & REVIEW", goal: "Learn what historical tests can and cannot tell you.", lessons: ["Use chronological training and test periods; avoid look-ahead bias.", "Include realistic spreads, fees, slippage, missing data, and varied market conditions."], practice: "Write a test protocol and reserve unseen data before tuning any rules.", sources: ["BIS Triennial Survey", "CME Group Education"] },
  { title: "Evaluate evidence", phase: "PRACTICE & REVIEW", goal: "Assess performance with more than a win rate.", lessons: ["Review after-cost expectancy, drawdown, sample size, and performance across regimes.", "Check probability calibration and compare model ideas against simple baselines."], practice: "Design a timestamped signal log that records confidence before outcomes are known.", sources: ["CME Group Education"] },
  { title: "Paper-trading simulation", phase: "PRACTICE & REVIEW", goal: "Practice following written rules without risking money.", lessons: ["Use simulated funds or a spreadsheet with timestamped prices and hypothetical costs.", "Record rule changes and avoid changing rules mid-test without starting a new evaluation."], practice: "Log hypothetical setup, entry, exit, and no-trade decisions. Practice is not proof of an edge.", sources: ["CFTC Learn & Protect", "NFA Investor Resources"] },
  { title: "Review and next steps", phase: "PRACTICE & REVIEW", goal: "Summarize learning, gaps, and a responsible next research plan.", lessons: ["Review your journal for data quality, rule-following, errors, and emotional patterns.", "Write what evidence would change your mind and identify topics for further study."], practice: "Prepare a report with sources, methodology, costs, results, uncertainties, and lessons. Do not treat a short simulation as evidence of future profits.", sources: ["All program sources"] }
];

const STORAGE_KEY = 'rikx-learning-program-v1';
const CHAT_KEY = 'rikx-chat-history-v1';
const MEMORY_KEY = 'rikx-learning-memory-v1';

const weekList = document.querySelector('#week-list');
const progressCount = document.querySelector('#completed-count');
const progressFill = document.querySelector('#progress-fill');
const progressBar = document.querySelector('#progress-bar');
const progressHint = document.querySelector('#progress-hint');
const chatLog = document.querySelector('#chat-messages');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const memoryStatus = document.querySelector('#memory-status');
const clearChatButton = document.querySelector('#clear-chat');
const sendButton = document.querySelector('.send-button');

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const completedWeeks = new Set(loadJSON(STORAGE_KEY, []).filter((week) => Number.isInteger(week) && week >= 0 && week < weeks.length));

function renderWeeks() {
  const weekListTarget = document.querySelector('#week-list');
  weekListTarget.replaceChildren();
  const nextWeek = weeks.findIndex((_, index) => !completedWeeks.has(index));

  weeks.forEach((week, index) => {
    const card = document.createElement('article');
    card.className = `week-card${completedWeeks.has(index) ? ' is-complete' : ''}`;
    const details = document.createElement('details');
    details.open = index === nextWeek;

    const summary = document.createElement('summary');
    summary.className = 'week-summary';
    const number = document.createElement('span');
    number.className = 'week-number';
    number.textContent = String(index + 1).padStart(2, '0');

    const titleWrap = document.createElement('span');
    titleWrap.className = 'week-title-wrap';
    const phase = document.createElement('span');
    phase.className = 'week-phase';
    phase.textContent = week.phase;
    const title = document.createElement('strong');
    title.textContent = week.title;
    titleWrap.append(phase, title);

    const icon = document.createElement('span');
    icon.className = 'chevron';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = '+';
    summary.append(number, titleWrap, icon);

    const content = document.createElement('div');
    content.className = 'week-content';
    const goal = document.createElement('p');
    goal.className = 'week-goal';
    goal.textContent = week.goal;
    content.append(goal);
    appendList(content, 'Study', week.lessons);

    const practiceHeading = document.createElement('h3');
    practiceHeading.textContent = 'Practice';
    const practice = document.createElement('p');
    practice.textContent = week.practice;
    const sourceHeading = document.createElement('h3');
    sourceHeading.textContent = 'Suggested sources';
    const sourceList = document.createElement('p');
    sourceList.className = 'source-tags';
    sourceList.textContent = week.sources.join(' · ');
    content.append(practiceHeading, practice, sourceHeading, sourceList);

    const label = document.createElement('label');
    label.className = 'complete-label';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = completedWeeks.has(index);
    checkbox.setAttribute('aria-label', `Mark week ${index + 1} complete`);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) completedWeeks.add(index);
      else completedWeeks.delete(index);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...completedWeeks]));
      } catch {
        progressHint.textContent = 'Progress could not be saved in this browser, but you can still use the program.';
      }
      renderWeeks();
    });

    const labelText = document.createElement('span');
    labelText.textContent = 'Mark this week complete';
    label.append(checkbox, labelText);
    content.append(label);
    details.append(summary, content);
    card.append(details);
    weekListTarget.append(card);
  });

  const count = completedWeeks.size;
  progressCount.textContent = String(count);
  progressFill.style.width = `${(count / weeks.length) * 100}%`;
  progressBar.setAttribute('aria-valuenow', String(count));
  progressHint.textContent = count === weeks.length
    ? 'Program complete. Review your journal; completion does not demonstrate a profitable strategy.'
    : count === 0
      ? 'Start with Week 1. Mark a week complete after its study and practice.'
      : `${weeks.length - count} ${weeks.length - count === 1 ? 'week' : 'weeks'} remaining. Progress is saved locally in this browser.`;
}

function appendList(parent, headingText, items) {
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  const list = document.createElement('ul');
  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.append(li);
  });
  parent.append(heading, list);
}

let chatHistory = loadJSON(CHAT_KEY, []);
if (!Array.isArray(chatHistory)) chatHistory = [];

let learningMemory = loadJSON(MEMORY_KEY, []);
if (!Array.isArray(learningMemory)) learningMemory = [];

function updateMemoryStatus() {
  memoryStatus.textContent = learningMemory.length
    ? `${learningMemory.length} note${learningMemory.length === 1 ? '' : 's'} saved on this device. Say “forget that” to remove a note.`
    : 'Messages and notes you ask Rikx to remember stay in this browser only.';
}

function addMessage(role, text, save = true) {
  const message = { role, text: String(text).slice(0, 2000) };
  const bubble = document.createElement('article');
  bubble.className = `chat-message ${role === 'user' ? 'user-message' : 'rikx-message'}`;

  const name = document.createElement('strong');
  name.className = 'message-name';
  name.textContent = role === 'user' ? 'You' : 'Rikx · AI coach';

  const body = document.createElement('p');
  body.textContent = message.text;

  bubble.append(name, body);
  chatLog.append(bubble);
  chatLog.scrollTop = chatLog.scrollHeight;

  if (save) {
    chatHistory.push(message);
    chatHistory = chatHistory.slice(-60);
    safeSave(CHAT_KEY, chatHistory);
  }
}

function getLocalCommandReply(input) {
  const lower = input.toLowerCase();

  const rememberMatch = input.match(/^(?:rikx[, ]+)?remember(?: that)?[: ]+(.+)$/i);
  if (rememberMatch) {
    const note = rememberMatch[1].trim().slice(0, 180);
    if (note.length < 3) return 'Tell me what you want me to remember, for example: “Remember that I prefer simple explanations.”';
    learningMemory.push(note);
    learningMemory = learningMemory.slice(-12);
    safeSave(MEMORY_KEY, learningMemory);
    updateMemoryStatus();
    return `Got it. I saved this note in your browser: “${note}” It can help tailor future replies on this device.`;
  }

  if (/forget (?:that|it|everything|my notes)|clear memory/.test(lower)) {
    learningMemory = [];
    safeSave(MEMORY_KEY, learningMemory);
    updateMemoryStatus();
    return 'I cleared the learning notes stored in this browser.';
  }

  return null;
}

function answerRikxFallback(input) {
  const lower = input.toLowerCase();
  const simple = /\b(simple|simply|beginner|plain language|short)\b/.test(lower) || learningMemory.some((note) => /simple|short|beginner/i.test(note));

  if (/^(hi|hello|hey|good morning|good evening)\b/.test(lower)) {
    return "Hey! I'm Rikx-AI, your forex learning coach. Ask me about pips, leverage, risk, or the 12-week curriculum.";
  }

  if (/what is (?:a )?pip|\bpips?\b/.test(lower)) {
    return simple
      ? 'A pip is a small standard move in a currency pair. For most pairs, it is 0.0001; for many JPY pairs, it is 0.01. Always check the quote format.'
      : 'A pip is a standard unit used to describe a small price change in a forex pair. For most pairs it is 0.0001 while many JPY pairs use 0.01. The exact value depends on the pair and position size.';
  }

  if (/leverage|margin/.test(lower)) {
    return simple
      ? 'Leverage lets you control a larger position with a smaller deposit. It magnifies both gains and losses, so risk management is essential.'
      : 'Leverage is exposure relative to the funds supporting a position, and margin is the collateral required by a broker. Both gains and losses are magnified, which can create rapid drawdowns.';
  }

  if (/spread|bid.?ask|slippage|execution/.test(lower)) {
    return 'The bid is what you can sell at, the ask is what you can buy at, and the spread is the difference. Slippage is when the final execution differs from the expected price.';
  }

  if (/risk|safe|should i trade|buy|sell|entry|signal|prediction|profit/.test(lower)) {
    return 'I can explain risk, market concepts, and process, but I should not tell you to buy or sell or promise profits. A responsible approach is to study, test on paper, and size risk carefully.';
  }

  if (/backtest|test (?:a )?strateg|win rate|accuracy|model/.test(lower)) {
    return 'A useful backtest is chronological, uses rules defined before seeing the results, and includes realistic spreads, fees, slippage, and out-of-sample testing. Win rate alone is not enough.';
  }

  if (/what should i study|this week|study plan|curriculum|week/.test(lower)) {
    const next = weeks.findIndex((_, index) => !completedWeeks.has(index));
    if (next === -1) {
      return 'You have completed the 12-week program. Review the notes, limitations, and areas you still want to study before assuming a strategy works.';
    }
    const item = weeks[next];
    return `Your next topic is Week ${next + 1}: ${item.title}. Goal: ${item.goal}. Practice: ${item.practice}`;
  }

  if (/remember|learn about me|adapt|personaliz/.test(lower)) {
    return 'You can personalize this local demo by saying: “Remember that I prefer simple explanations.” I store that note in your browser only. Real AI personalization needs a secure backend and private data controls.';
  }

  const noteLine = learningMemory.length ? ` I have ${learningMemory.length} saved note${learningMemory.length === 1 ? '' : 's'} about your learning preferences.` : '';
  return `I can explain forex basics, risk, and study planning. Try asking about pips, leverage, spreads, backtesting, or the curriculum.${noteLine} If your AI key is configured, I can also answer in a more natural conversational style through the backend.`;
}

async function sendMessageToAI(message) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message,
      history: chatHistory.slice(-20),
      memory: learningMemory
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || 'The AI service is unavailable.');
  }

  return data.reply || 'The AI did not return a reply.';
}

if (chatHistory.length) {
  chatHistory.slice(-60).forEach(({ role, text }) => {
    if ((role === 'user' || role === 'assistant') && typeof text === 'string') {
      const bubble = document.createElement('article');
      bubble.className = `chat-message ${role === 'user' ? 'user-message' : 'rikx-message'}`;
      const name = document.createElement('strong');
      name.className = 'message-name';
      name.textContent = role === 'user' ? 'You' : 'Rikx · AI coach';
      const body = document.createElement('p');
      body.textContent = text;
      bubble.append(name, body);
      chatLog.append(bubble);
    }
  });
}

if (!chatLog.children.length) {
  addMessage('assistant', "Hi, I'm Rikx-AI. Ask about forex basics, risk, or what to study next. If your API key is configured, I can respond using the live AI backend.", false);
}

updateMemoryStatus();

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = chatInput.value.trim();
  if (!text || sendButton.disabled) return;

  addMessage('user', text);
  chatInput.value = '';
  sendButton.disabled = true;

  const localCommandReply = getLocalCommandReply(text);
  if (localCommandReply) {
    addMessage('assistant', localCommandReply);
    sendButton.disabled = false;
    return;
  }

  try {
    const reply = await sendMessageToAI(text);
    addMessage('assistant', reply);
  } catch (error) {
    addMessage('assistant', answerRikxFallback(text));
  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
});

document.querySelectorAll('.suggestion').forEach((button) => {
  button.addEventListener('click', () => {
    chatInput.value = button.dataset.prompt;
    chatForm.requestSubmit();
    chatInput.focus();
  });
});

clearChatButton.addEventListener('click', () => {
  chatHistory = [];
  learningMemory = [];
  safeSave(CHAT_KEY, chatHistory);
  safeSave(MEMORY_KEY, learningMemory);
  chatLog.replaceChildren();
  addMessage('assistant', 'Chat and learning notes cleared from this browser. What would you like to learn?', false);
  updateMemoryStatus();
});

renderWeeks();
