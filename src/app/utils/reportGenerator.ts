import { jsPDF } from "jspdf";

export const generateOpportunityReport = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 15;

  const addTitle = (text: string, size = 16) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.text(text, margin, yPos);
    yPos += 8;
  };

  const addSubTitle = (text: string, size = 12) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 102, 204);
    doc.text(text, margin, yPos);
    yPos += 6;
    doc.setTextColor(0, 0, 0);
  };

  const addBodyText = (text: string, size = 9, bold = false) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPos);
    yPos += (lines.length * size * 1.1) / 2 + 2;
  };

  const checkPageBreak = (needed: number) => {
    if (yPos + needed > 285) { doc.addPage(); yPos = 15; }
  };

  addTitle("Supply Cost Variation Opportunity Analysis");
  doc.setDrawColor(0, 174, 255);
  doc.setFillColor(245, 247, 249);
  doc.rect(margin, yPos, contentWidth, 12, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ID: OPP-1070003440-OUT-2412b776", margin + 4, yPos + 7.5);
  doc.text("Date: 2026-01-30", margin + 65, yPos + 7.5);
  doc.text("Category: Supplies", margin + 110, yPos + 7.5);
  doc.text("Setting: Outpatient", margin + 150, yPos + 7.5);
  yPos += 18;

  addSubTitle("Opportunity Summary");
  addBodyText("Standardizing knee replacement implants and bone cement to lower-cost alternatives represents a significant organization-wide opportunity.");

  addSubTitle("Key Metrics");
  const metrics = [
    ["Cost Savings Opportunity (Annual)", "$20,759 - $222,222", "High Confidence (95% CI)"],
    ["Avg Savings per Case", "$550", "98.6% Variation Probability"],
    ["Current Avg Supply Cost", "$5,089", "Provider 6e73ff31 Baseline"],
    ["Peer Baseline (50th %)", "$4,722 - $5,280", "Clinically Equivalent Cohort"],
    ["Annual Case Volume", "219", "Current Individual Volume"]
  ];

  doc.setDrawColor(220, 220, 220);
  metrics.forEach((row) => {
    doc.setFont("helvetica", "bold");
    doc.text(row[0], margin, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(row[1], margin + 65, yPos);
    doc.setTextColor(100, 100, 100);
    doc.text(row[2], margin + 120, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 6;
  });
  yPos += 6;

  addSubTitle("Detected Variation");
  addBodyText("\u2022 Cost Driver 1: Provider 6e73ff31 exclusively uses premium Palacos bone cement ($110-123/unit) at higher utilization rates.");
  addBodyText("\u2022 Cost Driver 2: Use of premium knee implants ($4,930-5,400) vs standardized components ($4,500-4,813).");

  doc.addPage();
  yPos = 15;
  addSubTitle("Comparative Provider Analysis");
  doc.setFont("helvetica", "bold");
  doc.text("Provider 6e73ff31 (High Variation)", margin, yPos);
  yPos += 5;
  addBodyText("Uses premium brands exclusively. Mean implant cost is $4,930.43.");
  yPos += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Peer Benchmark (ae5b2ef4)", margin, yPos);
  yPos += 5;
  addBodyText("Demonstrates standardized pricing for key components.");

  checkPageBreak(50);
  doc.setDrawColor(150, 150, 150);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;
  addSubTitle("Appendix: Case & Provider Metadata");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text("Procedure:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL KNEE REPLACEMENT (MSK Service Line)", margin + 35, yPos);
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.text("CPT Codes:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text("27447, 36415, 97116, C1713, 97165", margin + 35, yPos);
  yPos += 15;

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text("Report Generated: 2026-01-30 14:11:58. Confidential Document.", margin, 288);

  doc.save("Full_Opportunity_Report_OPP-1070003440.pdf");
};
