const LETTERS = ["A", "B", "C", "D"];

const homeScreen = document.getElementById("home");
const quizScreen = document.getElementById("quiz");
const resultScreen = document.getElementById("result");
const progressEl = document.getElementById("progress");
const timerEl = document.getElementById("timer");
const questionEl = document.getElementById("question-text");
const optionsEl = document.getElementById("options");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const finishBtn = document.getElementById("finish-btn");

let quiz = [];
let userAnswers = [];
let current = 0;
let startTime = 0;
let timerId = null;

// Fisher–Yates shuffle, returns a new array
const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// Shuffle question order, and shuffle the order of the 4 options inside each question.
// Option text is untouched; we only track where the correct option ends up.
const buildQuiz = () => {
  return shuffle(QUESTIONS).map((q) => {
    const correctIndex = LETTERS.indexOf(q.answer);
    const order = shuffle([0, 1, 2, 3]);
    return {
      question: q.question,
      options: order.map((i) => q.options[i]),
      correct: order.indexOf(correctIndex),
    };
  });
};

const formatTime = (ms) => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
};

const tick = () => {
  timerEl.textContent = formatTime(Date.now() - startTime);
};

const showScreen = (screen) => {
  [homeScreen, quizScreen, resultScreen].forEach((el) => el.classList.add("hidden"));
  screen.classList.remove("hidden");
  window.scrollTo(0, 0);
};

const renderQuestion = () => {
  const q = quiz[current];
  progressEl.textContent = `Question ${current + 1} of ${quiz.length}`;
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";

  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    if (userAnswers[current] === i) {
      btn.classList.add("selected");
    }
    const letter = document.createElement("span");
    letter.className = "letter";
    letter.textContent = `${LETTERS[i]}.`;
    const body = document.createElement("span");
    body.textContent = text;
    btn.append(letter, body);
    btn.addEventListener("click", () => {
      userAnswers[current] = i;
      renderQuestion();
    });
    optionsEl.appendChild(btn);
  });

  const isLast = current === quiz.length - 1;
  prevBtn.disabled = current === 0;
  nextBtn.classList.toggle("hidden", isLast);
  finishBtn.classList.toggle("hidden", !isLast);
};

const startQuiz = () => {
  quiz = buildQuiz();
  userAnswers = new Array(quiz.length).fill(null);
  current = 0;
  startTime = Date.now();
  tick();
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);
  showScreen(quizScreen);
  renderQuestion();
};

const showResult = () => {
  clearInterval(timerId);
  const timeTaken = formatTime(Date.now() - startTime);

  const wrong = [];
  quiz.forEach((q, i) => {
    if (userAnswers[i] !== q.correct) {
      wrong.push({ q, picked: userAnswers[i] });
    }
  });
  const correctCount = quiz.length - wrong.length;

  document.getElementById("score").textContent = `Score: ${correctCount} / ${quiz.length}`;
  document.getElementById("summary").textContent =
    `Correct: ${correctCount} · Wrong: ${wrong.length} · Time: ${timeTaken}`;

  const list = document.getElementById("wrong-list");
  list.innerHTML = "";
  document.getElementById("wrong-heading").classList.toggle("hidden", wrong.length === 0);

  wrong.forEach(({ q, picked }) => {
    const item = document.createElement("div");
    item.className = "wrong-item";

    const qText = document.createElement("p");
    qText.className = "q";
    qText.textContent = q.question;

    const yours = document.createElement("p");
    yours.className = "your";
    yours.textContent = picked === null
      ? "Your answer: Not answered"
      : `Your answer: ${LETTERS[picked]}. ${q.options[picked]}`;

    const right = document.createElement("p");
    right.className = "correct";
    right.textContent = `Correct answer: ${LETTERS[q.correct]}. ${q.options[q.correct]}`;

    item.append(qText, yours, right);
    list.appendChild(item);
  });

  showScreen(resultScreen);
};

prevBtn.addEventListener("click", () => {
  if (current > 0) {
    current--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (current < quiz.length - 1) {
    current++;
    renderQuestion();
  }
});

finishBtn.addEventListener("click", () => {
  const unanswered = userAnswers.filter((a) => a === null).length;
  if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Finish anyway?`)) {
    return;
  }
  showResult();
});

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("restart-btn").addEventListener("click", startQuiz);
