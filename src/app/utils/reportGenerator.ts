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
    if (yPos + needed > 285) {
      doc.addPage();
      yPos = 15;
    }
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
  addBodyText("Standardizing knee replacement implants and bone cement to lower-cost alternatives represents a significant organization-wide opportunity. With a confirmed 98.6% probability of cost variation ($550/case), system-wide implementation could yield $1M+ in annual savings while maintaining equivalent clinical outcomes and patient satisfaction.");

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
  addBodyText("\u2022 Cost Driver 1: Provider 6e73ff31 exclusively uses premium Palacos bone cement ($110-123/unit) at higher utilization rates (up to 4 units/case). Peers use clinically equivalent Simplex/Depuy cement ($65-166/unit) at 2.19 units/case.");
  addBodyText("\u2022 Cost Driver 2: Use of premium knee implants ($4,930-5,400) vs standardized components ($4,500-4,813). Standardizing these components across the outpatient musculoskeletal line would save $120,483 annually for this provider alone.");

  doc.addPage();
  yPos = 15;

  addSubTitle("Comparative Provider Analysis");
  
  doc.setFont("helvetica", "bold");
  doc.text("Provider 6e73ff31 (High Variation)", margin, yPos);
  yPos += 5;
  addBodyText("Uses premium brands exclusively. Mean implant cost is $4,930.43, rising to $5,400 for specific sets. Most common combination (Knee Total + Palacos R) averages $5,070.82\u2014approximately $500 higher than peer leaders.");

  yPos += 3;
  doc.setFont("helvetica", "bold");
  doc.text("Peer Benchmark (ae5b2ef4)", margin, yPos);
  yPos += 5;
  addBodyText("Demonstrates standardized pricing for key components: Patella ($460), Tibial bearing inserts ($800), and Femoral components ($1,498-1,720). Uses Simplex/Depuy CMW2 cement at significantly lower price points.");

  yPos += 8;
  addSubTitle("Detailed Opportunity Metrics");
  const tableHeaders = ["Metric Name", "Provider Value", "Peer Range", "Variation"];
  const tableRows = [
    ["Supply Cost Per Case ($)", "$5,089", "$4,722-$5,280", "-$191 (Avg)"],
    ["Annualized Spend ($)", "$1,114,426", "$21K - $1.08M", "+$26,151"],
    ["Usage Variation (%)", "92%", "42% - 100%", "-8% Gap"],
    ["Annual Case Volume", "219", "4 - 216", "+3 Cases"],
    ["Length of Stay (Days)", "0.50", "0.50 - 1.40", "Optimal"],
    ["Utilization Percent", "92.4%", "41.6% - 100%", "High"]
  ];

  doc.setFont("helvetica", "bold");
  tableHeaders.forEach((h, i) => doc.text(h, margin + i * 45, yPos));
  yPos += 6;
  doc.setFont("helvetica", "normal");
  tableRows.forEach(row => {
    row.forEach((cell, i) => doc.text(cell.toString(), margin + i * 45, yPos));
    yPos += 5.5;
  });

  doc.addPage();
  yPos = 15;
  addSubTitle("Performance Analytics & Trend Analysis");
  addBodyText("Statistical Process Control (SPC) shows Provider 6e73ff31 operates consistently above the control mean for supply costs over the last 12 months. This variation is systematic and not attributed to patient risk profiles or case complexity.");
  
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(250, 252, 254);
  doc.rect(margin, yPos, contentWidth, 70, "F");
  doc.setFont("helvetica", "italic");
  doc.text("[SPC Trend Chart: Supply Cost Per Surgery (12-Month)]", pageWidth / 2, yPos + 35, { align: "center" });
  yPos += 75;

  doc.rect(margin, yPos, contentWidth, 70, "F");
  doc.text("[Impact Forest Plot: Supply Category Clustering & Density]", pageWidth / 2, yPos + 35, { align: "center" });
  yPos += 80;

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
  yPos += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Primary Provider:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text("Susan Wilson (ID: 6e73ff31) - 38 Locations", margin + 35, yPos);
  yPos += 5;

  doc.setFont("helvetica", "bold");
  doc.text("Analysis Confidence:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.text("98.6% (Systematic Variation Confirmed)", margin + 35, yPos);
  yPos += 15;

  doc.setFontSize(7.5);
  doc.setTextColor(150, 150, 150);
  doc.text("Report Generated: 2026-01-30 14:11:58. Confidential Document.", margin, 288);

  doc.save("Full_Opportunity_Report_OPP-1070003440.pdf");
};
