let questions = [];
let filteredQuestions = [];
let currentQuestionIndex = 0;
let selectedLevel = "beginner";
let spokenAnswer = "";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM fully loaded");

  // Load questions from JSON
  fetch("/data/questions-javascript.json")
    .then(res => res.json())
    .then(data => {
      questions = data;
      console.log("✅ Loaded questions:", questions.length);
    });

  // On Start Interview button click
  document.getElementById("askQuestion").addEventListener("click", () => {
    selectedLevel = document.getElementById("level").value;

    filteredQuestions = questions.filter(q => q.level === selectedLevel);
    if (filteredQuestions.length === 0) {
      alert("No questions found for this level.");
      return;
    }

    currentQuestionIndex = 0;
    askCurrentQuestion();
  });

  document.getElementById("recordBtn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onresult = (event) => {
      spokenAnswer = event.results[0][0].transcript;
      document.getElementById("spokenText").innerText = spokenAnswer;
    };
  });

  document.getElementById("submitBtn").addEventListener("click", async () => {
    const code = window.editor.getValue();
    const questionText = filteredQuestions[currentQuestionIndex].question;

    const response = await fetch("/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: questionText,
        code,
        answer: spokenAnswer
      })
    });

    const result = await response.json();
    alert("Feedback: " + result.feedback);

    if (result.pdf) {
      const a = document.createElement("a");
      a.href = result.pdf;
      a.download = "AI_Interview_Report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < filteredQuestions.length) {
      askCurrentQuestion();
    } else {
      alert("✅ Interview Complete!");
    }
  });

  // Monaco Editor
  require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.34.1/min/vs" }});
  require(["vs/editor/editor.main"], () => {
    window.editor = monaco.editor.create(document.getElementById("editor"), {
      value: "// Write your code here",
      language: "javascript",
      theme: "vs-dark"
    });
  });
});

function askCurrentQuestion() {
  const question = filteredQuestions[currentQuestionIndex].question;
  document.getElementById("question").innerText = question;
  const utterance = new SpeechSynthesisUtterance(question);
  speechSynthesis.speak(utterance);
}
