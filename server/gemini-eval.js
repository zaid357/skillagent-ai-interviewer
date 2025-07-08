
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateInterview(question, code, answer) {
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const prompt = `
You are an expert AI interviewer.
Evaluate the following candidate's response to a coding interview question.

Question: ${question}
Candidate's Spoken Answer: ${answer}
Candidate's Code Answer:
${code}

Respond in this JSON format:
{
  "feedback": "...",
  "explanationScore": 7,
  "codeScore": 8,
  "correctAnswer": "...",
  "improvementTopics": ["...", "..."]
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const response = await result.response.text();
    const cleaned = response.trim().replace(/^```json|```$/g, "");
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Error in evaluateInterview:", err);
    throw err;
  }
}

module.exports = evaluateInterview;
