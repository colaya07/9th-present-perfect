const matchingItems = [
  {prompt:"Have you ever visited another country?", answer:"Ask about a life experience."},
  {prompt:"I've never eaten octopus.", answer:"Say something has not happened in your life."},
  {prompt:"She's just arrived at school.", answer:"Describe something that happened a very short time ago."},
  {prompt:"Have you finished your project yet?", answer:"Ask if something has happened by now."},
  {prompt:"I've already sent the email.", answer:"Say something happened sooner than expected."},
  {prompt:"We've lived here for six years.", answer:"Describe a duration of time."},
  {prompt:"He's worked here since 2022.", answer:"Give the starting point of an ongoing situation."},
  {prompt:"I can't open the door. I've lost my key.", answer:"Connect a past action to a present result."},
  {prompt:"They have completed three courses so far.", answer:"Describe progress up to the present."},
  {prompt:"Have you seen my notebook?", answer:"Ask about a past event without saying when."}
];

const matchingContainer = document.getElementById("matching-questions");
const matchingScore = document.getElementById("matching-score");
const matchingFeedback = document.getElementById("matching-feedback");
const matchingStatus = document.getElementById("matching-status");
let matchingChecked = false;
let matchingResult = null;
let readingResult = null;

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function renderMatching() {
  matchingContainer.innerHTML = "";
  const options = shuffle(matchingItems.map(item => item.answer));
  matchingItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "match-row";
    row.dataset.index = String(index);
    const prompt = document.createElement("div");
    prompt.className = "match-prompt";
    const num = document.createElement("span");
    num.className = "match-num";
    num.textContent = String(index + 1).padStart(2, "0");
    const text = document.createElement("span");
    text.textContent = item.prompt;
    prompt.append(num, text);
    const select = document.createElement("select");
    select.id = `match-${index}`;
    select.setAttribute("aria-label", `Choose the meaning for item ${index + 1}`);
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "Choose a meaning…";
    select.append(blank);
    options.forEach(optionText => {
      const option = document.createElement("option");
      option.value = optionText;
      option.textContent = optionText;
      select.append(option);
    });
    select.addEventListener("change", () => {
      if (matchingChecked) {
        matchingChecked = false;
        matchingResult = null;
        matchingScore.textContent = "— / 10";
        matchingStatus.textContent = "Answers changed — check again";
        matchingFeedback.textContent = "";
        matchingFeedback.className = "feedback";
        updateResults();
      }
    });
    row.append(prompt, select);
    matchingContainer.append(row);
  });
}
renderMatching();

document.getElementById("check-matching").addEventListener("click", () => {
  let score = 0;
  let unanswered = 0;
  matchingItems.forEach((item, index) => {
    const row = matchingContainer.querySelector(`[data-index="${index}"]`);
    const select = document.getElementById(`match-${index}`);
    row.classList.remove("correct", "incorrect");
    if (!select.value) unanswered++;
    if (select.value === item.answer) {
      score++;
      row.classList.add("correct");
    } else {
      row.classList.add("incorrect");
    }
  });
  matchingChecked = true;
  matchingResult = score;
  matchingScore.textContent = `${score} / ${matchingItems.length}`;
  matchingStatus.textContent = "Completed";
  matchingFeedback.textContent = unanswered ? `You scored ${score}/${matchingItems.length}. ${unanswered} question(s) unanswered; review the highlighted items.` : `You scored ${score}/${matchingItems.length}. ${score === matchingItems.length ? "Excellent work!" : "Review the highlighted items and try to understand why."}`;
  matchingFeedback.className = `feedback ${score === matchingItems.length ? "success" : "error"}`;
  updateResults();
});
document.getElementById("reset-matching").addEventListener("click", () => {
  matchingChecked = false; matchingResult = null;
  renderMatching();
  matchingScore.textContent = "— / 10";
  matchingStatus.textContent = "Not completed";
  matchingFeedback.textContent = "";
  matchingFeedback.className = "feedback";
  updateResults();
});

const readingAnswers = {
  r1: {answer:"b", explanation:"Her first project received very few views."},
  r2: {answer:"true", explanation:"The text says she has practised every weekend since then."},
  r3: {answer:["plan a story","record clear sound","edit clips"], explanation:"Any two: plan a story, record clear sound, or edit clips on her laptop.", partial:true},
  r4: {answer:"b", explanation:"Her most recent film is about a community garden."},
  r5: {answer:"true", explanation:"She finished it last month, and the organisers showed it at a local event."},
  r6: {answer:["film club","local film club"], explanation:"She has met them at a local film club.", partial:true},
  r7: {answer:"a", explanation:"Maya says learning a new skill has taught her to be patient."},
  r8: {answer:["documentary","a documentary"], explanation:"She hopes to make a documentary about young people in her city.", partial:true}
};
function normalize(text) {
  return text.toLowerCase().trim().replace(/[’']/g, "'").replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
}
function answerShort(id, config) {
  const value = normalize(document.getElementById(id).value);
  if (!value) return false;
  if (id === "r3") {
    const skills = ["plan a story", "record clear sound", "edit clips"];
    return skills.filter(skill => value.includes(skill)).length >= 2;
  }
  if (id === "r6") return value.includes("film club");
  if (id === "r8") return value.includes("documentary");
  return config.answer.includes(value);
}
function updateQuestionFeedback(id, isCorrect, explanation) {
  const el = document.getElementById(`${id}-feedback`);
  el.textContent = `${isCorrect ? "Correct!" : "Not quite."} ${explanation}`;
  el.className = `question-feedback ${isCorrect ? "success" : "error"}`;
}
document.getElementById("reading-form").addEventListener("submit", event => {
  event.preventDefault();
  let score = 0;
  Object.entries(readingAnswers).forEach(([id, config]) => {
    let correct = false;
    if (["r3","r6","r8"].includes(id)) {
      correct = answerShort(id, config);
    } else {
      const selected = document.querySelector(`input[name="${id}"]:checked`);
      correct = Boolean(selected && selected.value === config.answer);
    }
    if (correct) score++;
    updateQuestionFeedback(id, correct, config.explanation);
  });
  readingResult = score;
  document.getElementById("reading-score").textContent = `${score} / 8`;
  document.getElementById("reading-status").textContent = "Completed";
  const feedback = document.getElementById("reading-feedback");
  feedback.textContent = score === 8 ? "Excellent reading! You understood every key detail." : `You scored ${score}/8. Read the explanations and check the text again.`;
  feedback.className = `feedback ${score === 8 ? "success" : "error"}`;
  updateResults();
});
document.getElementById("reset-reading").addEventListener("click", () => {
  document.getElementById("reading-form").reset();
  readingResult = null;
  document.getElementById("reading-score").textContent = "— / 8";
  document.getElementById("reading-status").textContent = "Not completed";
  document.getElementById("reading-feedback").textContent = "";
  document.getElementById("reading-feedback").className = "feedback";
  Object.keys(readingAnswers).forEach(id => {
    const el = document.getElementById(`${id}-feedback`);
    el.textContent = "";
    el.className = "question-feedback";
  });
  updateResults();
});

function updateResults() {
  const finalMatching = document.getElementById("final-matching");
  const finalReading = document.getElementById("final-reading");
  const finalMatchingStatus = document.getElementById("final-matching-status");
  const finalReadingStatus = document.getElementById("final-reading-status");
  finalMatching.textContent = matchingResult === null ? "— / 10" : `${matchingResult} / 10`;
  finalReading.textContent = readingResult === null ? "— / 8" : `${readingResult} / 8`;
  finalMatchingStatus.textContent = matchingResult === null ? "Pending" : "Completed";
  finalReadingStatus.textContent = readingResult === null ? "Pending" : "Completed";
  const totalEl = document.getElementById("total-score");
  const message = document.getElementById("total-message");
  if (matchingResult === null || readingResult === null) {
    totalEl.textContent = "— / 18";
    message.textContent = "Complete both activities to calculate your score.";
  } else {
    const total = matchingResult + readingResult;
    totalEl.textContent = `${total} / 18`;
    const percent = total / 18;
    message.textContent = percent >= .85 ? "Outstanding work — you have a strong understanding of this lesson." :
      percent >= .65 ? "Good progress. Review any mistakes and keep practising." :
      "Keep going! Revisit the grammar notes and try the activities again.";
  }
}
document.getElementById("back-to-top").addEventListener("click", () => window.scrollTo({top:0, behavior:"smooth"}));

const writingArea = document.getElementById("student-writing");
const wordCount = document.getElementById("word-count");
const wordGuidance = document.getElementById("word-guidance");
function countWords(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}
writingArea.addEventListener("input", () => {
  const count = countWords(writingArea.value);
  wordCount.textContent = `${count} ${count === 1 ? "word" : "words"}`;
  wordGuidance.textContent = count < 100 ? `${100-count} more to reach 100` : count <= 150 ? "Within the target range ✓" : `${count-150} words over the target`;
  wordGuidance.style.color = count >= 100 && count <= 150 ? "#14744e" : "";
});
document.getElementById("review-writing").addEventListener("click", () => {
  const text = writingArea.value.trim();
  const count = countWords(text);
  const review = document.getElementById("writing-review");
  const checks = [...document.querySelectorAll(".checklist-panel input[type=checkbox]")];
  const checked = checks.filter(box => box.checked).length;
  const confidence = document.querySelector('input[name="confidence"]:checked');
  const feedback = [];
  if (!text) feedback.push("Write a paragraph before reviewing it.");
  else {
    if (count < 100) feedback.push(`Your paragraph has ${count} words. Add ${100-count} or more words to reach the suggested length.`);
    else if (count > 150) feedback.push(`Your paragraph has ${count} words. Consider reducing it by ${count-150} words.`);
    else feedback.push(`Your paragraph has ${count} words, which is within the 100–150 word target.`);
    feedback.push("Read each sentence and check for have/has + past participle. Remember: use the past simple with finished times such as yesterday or last year.");
    feedback.push(`You have checked ${checked} of 6 items on the self-correction checklist.`);
    if (!confidence) feedback.push("Choose a self-assessment statement to reflect on your confidence.");
    else if (confidence.value === "confident") feedback.push("You feel confident — challenge yourself to use a range of time expressions naturally.");
    else if (confidence.value === "practising") feedback.push("You are building confidence — focus on irregular participles and the difference between for and since.");
    else feedback.push("Review the grammar notes and practise forming questions and negatives before editing again.");
  }
  review.innerHTML = "";
  const heading = document.createElement("strong");
  heading.textContent = "Your review";
  const list = document.createElement("ul");
  feedback.forEach(item => { const li = document.createElement("li"); li.textContent = item; list.append(li); });
  review.append(heading, list);
  review.hidden = false;
  review.scrollIntoView({behavior:"smooth", block:"nearest"});
});
