
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const evaluateInterview = require("./gemini-eval");
const generatePdfReport = require("./pdf-generator");
const fs = require("fs");

if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/reports", express.static("reports"));

app.post("/evaluate", async (req, res) => {
  const { question, code, answer } = req.body;

  try {
    const feedback = await evaluateInterview(question, code, answer);
    const filename = `report-${Date.now()}.pdf`;
    const pdfPath = await generatePdfReport([{ ...feedback, question, code, answer }], filename);

    res.json({
      feedback: feedback.feedback,
      pdf: pdfPath
    });
  } catch (err) {
    console.error("Error from Gemini or PDF:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => console.log("✅ Server is running on http://localhost:3000"));
