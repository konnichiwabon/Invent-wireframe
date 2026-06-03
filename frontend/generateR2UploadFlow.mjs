import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({
  orientation: "landscape",
  unit: "pt",
  format: "a4",
});

const pageWidth = doc.internal.pageSize.getWidth();

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
  slateLight: [248, 250, 252],
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

function textBlock(text, x, y, maxWidth, lineHeight = 13) {
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line, index) => {
    doc.text(line, x, y + index * lineHeight);
  });
  return y + lines.length * lineHeight;
}

function box({ x, y, w, h, title, body, fill = colors.slateLight, border = colors.border }) {
  setFill(fill);
  setStroke(border);
  doc.roundedRect(x, y, w, h, 8, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(colors.title);
  doc.text(title, x + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
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
    doc.text(label, (x1 + x2) / 2 - 28, (y1 + y2) / 2 - 5);
  }
}

function sectionTitle(text, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setText(colors.title);
  doc.text(text, x, y);
}

doc.setFont("helvetica", "bold");
doc.setFontSize(20);
setText(colors.title);
doc.text("Profile Picture Upload Flow: React -> Django -> Cloudflare R2 -> Neon", 40, 40);

doc.setFont("helvetica", "normal");
doc.setFontSize(9);
setText(colors.muted);
doc.text("Generated for the Invent hardware inventory project.", 40, 58);

sectionTitle("End-to-End Flow", 40, 88);

const topY = 105;
const boxW = 140;
const boxH = 82;
const gap = 28;
const startX = 40;

box({
  x: startX,
  y: topY,
  w: boxW,
  h: boxH,
  title: "1. User Picks Image",
  body: "In EmployeeForm, the user clicks the avatar circle and chooses a local image file.",
  fill: colors.blueLight,
  border: colors.blue,
});

box({
  x: startX + (boxW + gap),
  y: topY,
  w: boxW,
  h: boxH,
  title: "2. Frontend Prepares",
  body: "React reads the file, crops it square, resizes it to 256 x 256, and converts it to a data:image string.",
});

box({
  x: startX + (boxW + gap) * 2,
  y: topY,
  w: boxW,
  h: boxH,
  title: "3. Save Asset",
  body: "The full asset payload is sent to Django using POST /assets or PUT /assets/{id}.",
});

box({
  x: startX + (boxW + gap) * 3,
  y: topY,
  w: boxW,
  h: boxH,
  title: "4. Django Detects Image",
  body: "save_profile_picture checks whether profilePictureUrl starts with data:image/...",
});

box({
  x: startX + (boxW + gap) * 4,
  y: topY,
  w: boxW,
  h: boxH,
  title: "5. Upload To R2",
  body: "Django decodes the image and uploads it to Cloudflare R2 using boto3 and the S3-compatible API.",
  fill: colors.greenLight,
  border: colors.green,
});

for (let i = 0; i < 4; i += 1) {
  const x = startX + boxW + gap * i + (boxW + gap) * i;
  arrow(x - gap + 6, topY + boxH / 2, x - 6, topY + boxH / 2);
}

sectionTitle("How The Picture Stays On The Right Card", 40, 235);

box({
  x: 40,
  y: 252,
  w: 250,
  h: 92,
  title: "R2 Object Key Includes Asset ID",
  body: "The uploaded file is stored with a key like: profile-pictures/{asset_id}/{uuid}.jpg. Because the asset ID is inside the key, the object is tied to one card.",
  fill: colors.amberLight,
  border: colors.amber,
});

box({
  x: 330,
  y: 252,
  w: 250,
  h: 92,
  title: "Neon Stores The Link",
  body: "The assets_asset row stores profilePictureKey. The asset row and the picture key are saved for the same asset ID.",
});

box({
  x: 620,
  y: 252,
  w: 180,
  h: 92,
  title: "Card Displays Its Row",
  body: "GET /assets returns each asset with its own profilePictureUrl. InventoryCard displays only the URL from its employee object.",
});

arrow(290, 298, 330, 298);
arrow(580, 298, 620, 298);

sectionTitle("Storage Responsibilities", 40, 382);

doc.setFont("helvetica", "bold");
doc.setFontSize(9.5);
setText(colors.title);
doc.text("Cloudflare R2", 55, 408);
doc.text("Neon PostgreSQL", 325, 408);
doc.text("Frontend", 595, 408);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
setText(colors.text);
textBlock(
  "Stores the raw image object. Example object key: profile-pictures/asset-123/abc123.jpg.",
  55,
  425,
  220,
);
textBlock(
  "Stores asset data and the R2 object key. It does not store the raw uploaded photo.",
  325,
  425,
  220,
);
textBlock(
  "Shows the picture URL returned by Django. It does not use R2 secret keys.",
  595,
  425,
  210,
);

sectionTitle("Relevant Code", 40, 498);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
setText(colors.text);
const codeRefs = [
  "frontend/src/components/EmployeeForm.tsx - avatar picker, image resize, data:image payload",
  "backend/assets/views.py - save_profile_picture, asset create/update flow",
  "backend/assets/r2_storage.py - decode data image, upload to R2, return signed/public URL",
  "backend/assets/models.py - profilePictureKey stored on Asset, profilePictureUrl returned to frontend",
  "backend/.env - R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT_URL",
];

codeRefs.forEach((line, index) => {
  doc.text(`${index + 1}. ${line}`, 55, 518 + index * 14);
});

doc.setFont("helvetica", "bold");
doc.setFontSize(9);
setText(colors.blue);
doc.text("Important: R2 secret keys stay in backend/.env only. They are never sent to React.", 40, 575);

const output = "../R2_Profile_Picture_Upload_Flow.pdf";
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")));
console.log(`Generated ${output}`);
