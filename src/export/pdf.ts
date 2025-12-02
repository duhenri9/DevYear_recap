import fs from "node:fs";
import PDFDocument from "pdfkit";

export type PdfOptions = {
  title?: string;
  outPath: string;
};

export function exportPdfFromMarkdown(markdown: string, options: PdfOptions): void {
  const doc = new PDFDocument({ margin: 50 });
  const stream = fs.createWriteStream(options.outPath);
  doc.pipe(stream);

  if (options.title) {
    doc.fontSize(20).text(options.title, { underline: true });
    doc.moveDown();
  }

  const lines = markdown.split("\n");
  lines.forEach((line) => {
    if (line.startsWith("# ")) {
      doc.moveDown(0.5).fontSize(18).text(line.replace("# ", ""), { underline: true });
    } else if (line.startsWith("## ")) {
      doc.moveDown(0.5).fontSize(14).text(line.replace("## ", ""), { underline: true });
    } else if (line.startsWith("- ")) {
      doc.fontSize(11).text(`• ${line.replace("- ", "")}`);
    } else {
      doc.fontSize(11).text(line);
    }
  });

  doc.end();
}
