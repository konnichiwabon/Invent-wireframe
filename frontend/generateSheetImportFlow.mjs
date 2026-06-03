import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({
  orientation: "landscape",
  unit: "pt",
  format: "a4",
});

const colors = {
  title: [17, 24, 39],
  text: [31, 41, 55],
  muted: [100, 116, 139],
  border: [203, 213, 225],
  blue: [37, 99, 235],
  blueLight: [219, 234, 254],
  green: [22, 163, 74],
  greenLight: [220, 252, 231],
  amber: [217, 119, 6],
  amberLight: [254, 243, 199],
  red: [220, 38, 38],
  redLight: [254, 226, 226],
  slateLight: [248, 250, 252],
  white: [255, 255, 255],
};

function setText(rgb = colors.text) {
  doc.setTextColor(...rgb);
}

function setStroke(rgb = colors.border) {
  doc.setDrawColor(...rgb);
}

function setFill(rgb = colors.slateLight) {
  doc.setFillColor(...rgb);
}

function textBlock(text, x, y, maxWidth, lineHeight = 12) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function box({ x, y, w, h, title, body, fill = colors.slateLight, border = colors.border }) {
  setFill(fill);
  setStroke(border);
  doc.setLineWidth(1);
  doc.roundedRect(x, y, w, h, 8, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(colors.title);
  doc.text(title, x + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.3);
  setText(colors.text);
  textBlock(body, x + 12, y + 34, w - 24, 11);
}

function arrow(x1, y1, x2, y2, label = "") {
  setStroke(colors.muted);
  doc.setLineWidth(1.2);
  doc.line(x1, y1, x2, y2);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;
  doc.line(x2, y2, x2 + Math.cos(left) * size, y2 + Math.sin(left) * size);
  doc.line(x2, y2, x2 + Math.cos(right) * size, y2 + Math.sin(right) * size);

  if (label) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    setText(colors.muted);
    doc.text(label, (x1 + x2) / 2 - 24, (y1 + y2) / 2 - 5);
  }
}

function sectionTitle(text, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setText(colors.title);
  doc.text(text, x, y);
}

function header(title, subtitle = "") {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setText(colors.title);
  doc.text(title, 40, 40);

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setText(colors.muted);
    doc.text(subtitle, 40, 58);
  }
}

function table({ x, y, columns, rows, widths, rowHeight = 24 }) {
  const totalWidth = widths.reduce((sum, width) => sum + width, 0);
  setFill(colors.blueLight);
  setStroke(colors.border);
  doc.rect(x, y, totalWidth, rowHeight, "FD");

  let currentX = x;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  setText(colors.title);
  columns.forEach((column, index) => {
    doc.text(column, currentX + 8, y + 15);
    currentX += widths[index];
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  rows.forEach((row, rowIndex) => {
    const rowY = y + rowHeight * (rowIndex + 1);
    setFill(rowIndex % 2 === 0 ? colors.white : colors.slateLight);
    setStroke(colors.border);
    doc.rect(x, rowY, totalWidth, rowHeight, "FD");

    currentX = x;
    row.forEach((cell, index) => {
      setText(colors.text);
      textBlock(String(cell), currentX + 8, rowY + 14, widths[index] - 16, 9);
      currentX += widths[index];
    });
  });
}

header(
  "HERMES / Sheet Import Process Flow",
  "Generated for the Invent hardware inventory project."
);

sectionTitle("End-to-End Flow", 40, 88);

const topY = 108;
const boxW = 124;
const boxH = 78;
const gap = 18;
const startX = 40;

const flowBoxes = [
  {
    title: "1. HERMES Sheet",
    body: "User gets a CSV or XLSX export from HERMES, or prepares a manual sheet with agreed column names.",
    fill: colors.blueLight,
    border: colors.blue,
  },
  {
    title: "2. Import Button",
    body: "User clicks Import Sheet in the frontend and chooses the file from their computer.",
  },
  {
    title: "3. Upload To Django",
    body: "React sends the file to the backend import endpoint. The frontend does not save rows directly.",
  },
  {
    title: "4. Parse Rows",
    body: "Django reads the sheet, extracts row data, normalizes headers, and prepares one payload per row.",
  },
  {
    title: "5. Validate",
    body: "Backend checks required fields, unique key, numeric values, and missing required columns.",
    fill: colors.amberLight,
    border: colors.amber,
  },
  {
    title: "6. Save Cards",
    body: "Rows are created or updated in Neon using the ORM schema, then the frontend refreshes the card list.",
    fill: colors.greenLight,
    border: colors.green,
  },
];

flowBoxes.forEach((item, index) => {
  const x = startX + index * (boxW + gap);
  box({ x, y: topY, w: boxW, h: boxH, ...item });
  if (index > 0) {
    const previousRight = x - gap;
    arrow(previousRight + 4, topY + boxH / 2, x - 6, topY + boxH / 2);
  }
});

sectionTitle("Recommended Sheet Columns", 40, 232);

table({
  x: 40,
  y: 252,
  columns: ["Sheet Column", "Maps To", "Required?", "Notes"],
  widths: [155, 210, 80, 300],
  rowHeight: 27,
  rows: [
    ["ID Tag or Asset ID", "Asset.idTag or Asset.id", "Yes", "Use this as the primary matching key to prevent duplicate cards."],
    ["Full Name", "Asset.name", "Yes", "Displayed as the card name."],
    ["Department", "Asset.department", "Yes", "Used for filtering and department badge."],
    ["Username", "Asset.username", "No", "Internal username or login name."],
    ["Omada Username", "Asset.omadaUsername", "No", "Can be renamed later if this is really email."],
    ["Hostname", "NetworkSpec.hostname", "No", "Can also be used as a fallback matching key."],
    ["CPU Model / CPU Cores", "CpuSpec", "No", "CPU cores should be numeric."],
    ["RAM / Storage / GPU", "RamSpec, StorageSpec, GpuSpec", "No", "Multiple devices can be supported later with repeated columns or separate rows."],
  ],
});

doc.addPage();
header(
  "Import Rules And Validation",
  "How the backend should decide whether each sheet row creates, updates, or fails."
);

sectionTitle("Primary Key / Matching Rule", 40, 88);

box({
  x: 40,
  y: 108,
  w: 230,
  h: 92,
  title: "Preferred Unique Key",
  body: "Use ID Tag or Asset ID as the primary lookup key. This is the safest way to trace one sheet row to one card.",
  fill: colors.blueLight,
  border: colors.blue,
});

box({
  x: 310,
  y: 108,
  w: 230,
  h: 92,
  title: "Fallback Unique Key",
  body: "If no ID Tag exists, use Hostname only if it is stable and unique across all devices.",
});

box({
  x: 580,
  y: 108,
  w: 230,
  h: 92,
  title: "Duplicate Prevention",
  body: "If the key already exists, update the existing card. If the key does not exist, create a new card.",
  fill: colors.greenLight,
  border: colors.green,
});

arrow(270, 154, 310, 154);
arrow(540, 154, 580, 154);

sectionTitle("Validation Checklist", 40, 238);

box({
  x: 40,
  y: 258,
  w: 245,
  h: 150,
  title: "Required Checks",
  body: "1. File is CSV or XLSX.\n2. Header row exists.\n3. Required columns exist.\n4. Name and Department are present.\n5. Unique key is present.\n6. CPU cores are numeric when provided.",
  fill: colors.amberLight,
  border: colors.amber,
});

box({
  x: 325,
  y: 258,
  w: 245,
  h: 150,
  title: "Error Reporting",
  body: "Return row-level messages such as: Row 5 missing Department, Row 8 has invalid CPU Cores, Row 11 duplicate ID Tag inside the same sheet.",
});

box({
  x: 610,
  y: 258,
  w: 200,
  h: 150,
  title: "Import Summary",
  body: "After import, show: rows processed, cards created, cards updated, rows skipped, and validation errors.",
  fill: colors.greenLight,
  border: colors.green,
});

sectionTitle("Security And Deployment Notes", 40, 460);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
setText(colors.text);
const notes = [
  "The frontend uploads the sheet to Django; secrets and database writes stay in the backend.",
  "The backend should reject very large files and unsupported file types.",
  "Do not trust column values blindly; validate before saving to Neon.",
  "Keep HERMES credentials, if any, in backend environment variables only.",
  "If HERMES has an API later, the backend can fetch the sheet automatically instead of requiring manual upload.",
];

notes.forEach((note, index) => {
  doc.text(`${index + 1}. ${note}`, 55, 482 + index * 16);
});

doc.addPage();
header(
  "User Experience Flow",
  "What the user should see while importing a HERMES or Excel sheet."
);

sectionTitle("Screen Flow", 40, 88);

box({
  x: 40,
  y: 108,
  w: 170,
  h: 84,
  title: "Import Sheet",
  body: "Button appears near Add Asset or in the top toolbar.",
  fill: colors.blueLight,
  border: colors.blue,
});

box({
  x: 250,
  y: 108,
  w: 170,
  h: 84,
  title: "Choose File",
  body: "User selects .xlsx or .csv. The UI can show the selected file name.",
});

box({
  x: 460,
  y: 108,
  w: 170,
  h: 84,
  title: "Preview / Validate",
  body: "Backend validates rows. Optional preview lets the user confirm the import.",
  fill: colors.amberLight,
  border: colors.amber,
});

box({
  x: 670,
  y: 108,
  w: 150,
  h: 84,
  title: "Import Results",
  body: "Show created, updated, skipped, and error counts.",
  fill: colors.greenLight,
  border: colors.green,
});

arrow(210, 150, 250, 150);
arrow(420, 150, 460, 150);
arrow(630, 150, 670, 150);

sectionTitle("Backend Save Flow", 40, 238);

box({
  x: 40,
  y: 258,
  w: 165,
  h: 88,
  title: "Normalize Row",
  body: "Clean header names, trim strings, convert blank cells to empty values.",
});

box({
  x: 240,
  y: 258,
  w: 165,
  h: 88,
  title: "Find Existing Card",
  body: "Search by ID Tag, Asset ID, or fallback Hostname.",
});

box({
  x: 440,
  y: 258,
  w: 165,
  h: 88,
  title: "Create Or Update",
  body: "Use Django ORM to save Asset plus CPU, RAM, GPU, Storage, Network, Peripheral, and System specs.",
  fill: colors.greenLight,
  border: colors.green,
});

box({
  x: 640,
  y: 258,
  w: 175,
  h: 88,
  title: "Refresh Frontend",
  body: "Frontend calls GET /assets so the imported cards appear immediately.",
});

arrow(205, 302, 240, 302);
arrow(405, 302, 440, 302);
arrow(605, 302, 640, 302);

sectionTitle("Decision Point", 40, 410);

box({
  x: 40,
  y: 430,
  w: 360,
  h: 95,
  title: "Manual Upload First",
  body: "Start with manual sheet upload. It is simpler, easier to test, and does not require HERMES API credentials.",
  fill: colors.blueLight,
  border: colors.blue,
});

box({
  x: 450,
  y: 430,
  w: 360,
  h: 95,
  title: "HERMES API Later",
  body: "If HERMES provides an API, Django can later pull the sheet/data automatically on a schedule or button click.",
  fill: colors.slateLight,
});

const output = "../HERMES_Sheet_Import_Process_Flow.pdf";
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")));
console.log(`Generated ${output}`);
