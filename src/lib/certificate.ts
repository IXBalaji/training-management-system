import jsPDF from "jspdf";

export function generateCertificate(
  userName: string,
  trainingTitle: string,
  trainerName: string,
  completionDate: string,
): Buffer {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Certificate background and styling
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 297, 210, "F");

  // Border
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(2);
  doc.rect(10, 10, 277, 190);

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(30, 64, 175);
  doc.text("Certificate of Completion", 148.5, 50, { align: "center" });

  // Subtitle
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.text("This certifies that", 148.5, 70, { align: "center" });

  // Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(17, 24, 39);
  doc.text(userName, 148.5, 90, { align: "center" });

  // Training details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.text("has successfully completed the training program", 148.5, 110, {
    align: "center",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(trainingTitle, 148.5, 130, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.text(`Conducted by: ${trainerName}`, 148.5, 150, { align: "center" });
  doc.text(`Completion Date: ${completionDate}`, 148.5, 165, {
    align: "center",
  });

  return Buffer.from(doc.output("arraybuffer"));
}
