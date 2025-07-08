
const fs = require("fs");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");

async function generatePdfReport(interviewArray, filename = "report.pdf") {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([600, 800]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text, y, size = 12) => {
    page.drawText(text, { x: 40, y, size, font, color: rgb(0, 0, 0) });
  };

  let y = 750;
  drawText("AI Interview Report", y, 18); y -= 30;
  drawText(`Date: ${new Date().toLocaleString()}`, y); y -= 20;

  interviewArray.forEach((data, idx) => {
    if (y < 150) {
      page = pdfDoc.addPage([600, 800]);
      y = 750;
    }
    drawText(`Q${idx + 1}: ${data.question}`, y); y -= 20;
    drawText(`Answer: ${data.answer}`, y); y -= 20;
    drawText("Code:", y); y -= 15;

    const codeLines = data.code.split("\n").slice(0, 15);
    codeLines.forEach(line => {
      drawText(line.slice(0, 90), y); y -= 15;
    });

    y -= 10;
    drawText(`Explanation Score: ${data.explanationScore}`, y); y -= 15;
    drawText(`Code Score: ${data.codeScore}`, y); y -= 15;
    drawText(`Correct Answer: ${data.correctAnswer}`, y); y -= 15;
    drawText(`Feedback: ${data.feedback}`, y); y -= 15;

    if (data.improvementTopics?.length) {
      drawText("Topics to improve:", y); y -= 15;
      data.improvementTopics.forEach(topic => {
        drawText(`- ${topic}`, y); y -= 15;
      });
    }
    y -= 20;
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(`./reports/${filename}`, pdfBytes);
  return `/reports/${filename}`;
}

module.exports = generatePdfReport;
