import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({
  orientation: "portrait",
  unit: "pt",
  format: "a4",
});

const page = {
  width: doc.internal.pageSize.getWidth(),
  height: doc.internal.pageSize.getHeight(),
  margin: 42,
};

const colors = {
  title: [17, 24, 39],
  text: [31, 41, 55],
  muted: [100, 116, 139],
  border: [203, 213, 225],
  blue: [37, 99, 235],
  blueLight: [239, 246, 255],
  green: [22, 101, 52],
  greenLight: [240, 253, 244],
  amber: [146, 64, 14],
  amberLight: [255, 251, 235],
  slateLight: [248, 250, 252],
};

let y = page.margin;

function setText(rgb = colors.text) {
  doc.setTextColor(...rgb);
}

function setFill(rgb = colors.slateLight) {
  doc.setFillColor(...rgb);
}

function setStroke(rgb = colors.border) {
  doc.setDrawColor(...rgb);
}

function ensureSpace(height) {
  if (y + height <= page.height - page.margin) return;
  doc.addPage();
  y = page.margin;
}

function title(text, subtitle) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  setText(colors.title);
  doc.text(text, page.margin, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setText(colors.muted);
  doc.text(subtitle, page.margin, y);
  y += 30;
}

function section(text) {
  ensureSpace(34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setText(colors.title);
  doc.text(text, page.margin, y);
  y += 16;
}

function paragraph(text, maxWidth = page.width - page.margin * 2) {
  const lines = doc.splitTextToSize(text, maxWidth);
  ensureSpace(lines.length * 12 + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  setText(colors.text);
  doc.text(lines, page.margin, y);
  y += lines.length * 12 + 8;
}

function bullet(items) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.2);
  setText(colors.text);
  for (const item of items) {
    const lines = doc.splitTextToSize(item, page.width - page.margin * 2 - 16);
    ensureSpace(lines.length * 12 + 6);
    doc.text("-", page.margin, y);
    doc.text(lines, page.margin + 16, y);
    y += lines.length * 12 + 6;
  }
  y += 2;
}

function codeBlock(lines) {
  const normalized = Array.isArray(lines) ? lines : [lines];
  const height = normalized.length * 12 + 20;
  ensureSpace(height);
  setFill([15, 23, 42]);
  setStroke([15, 23, 42]);
  doc.roundedRect(page.margin, y, page.width - page.margin * 2, height, 6, 6, "FD");
  doc.setFont("courier", "normal");
  doc.setFontSize(8.8);
  setText([226, 232, 240]);
  normalized.forEach((line, index) => {
    doc.text(line, page.margin + 12, y + 18 + index * 12);
  });
  y += height + 10;
}

function infoBox({ heading, body, fill, border }) {
  const maxWidth = page.width - page.margin * 2 - 24;
  const lines = doc.splitTextToSize(body, maxWidth);
  const height = 38 + lines.length * 11;
  ensureSpace(height + 10);
  setFill(fill);
  setStroke(border);
  doc.roundedRect(page.margin, y, page.width - page.margin * 2, height, 8, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setText(colors.title);
  doc.text(heading, page.margin + 12, y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.8);
  setText(colors.text);
  doc.text(lines, page.margin + 12, y + 34);
  y += height + 10;
}

function twoColumnComparison(left, right) {
  const gap = 18;
  const boxWidth = (page.width - page.margin * 2 - gap) / 2;
  const leftLines = doc.splitTextToSize(left.body, boxWidth - 24);
  const rightLines = doc.splitTextToSize(right.body, boxWidth - 24);
  const height = Math.max(leftLines.length, rightLines.length) * 11 + 48;
  ensureSpace(height + 12);

  for (const [index, item] of [left, right].entries()) {
    const x = page.margin + index * (boxWidth + gap);
    const lines = index === 0 ? leftLines : rightLines;
    setFill(item.fill);
    setStroke(item.border);
    doc.roundedRect(x, y, boxWidth, height, 8, 8, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    setText(colors.title);
    doc.text(item.heading, x + 12, y + 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    setText(colors.text);
    doc.text(lines, x + 12, y + 38);
  }

  y += height + 12;
}

function footer() {
  const count = doc.internal.getNumberOfPages();
  for (let i = 1; i <= count; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setText(colors.muted);
    doc.text(
      `Invent local vs production guide - page ${i} of ${count}`,
      page.margin,
      page.height - 24,
    );
  }
}

title(
  "Running Local vs Running on Production",
  "Backend connection notes for the Invent React + Django inventory app.",
);

infoBox({
  heading: "What this document is about",
  body:
    "The frontend was loading, and the backend server was running, but the app still looked disconnected. The reason was not one single frontend problem. The local Django API first rejected local hosts, then the /assets endpoint crashed because the database was missing a pending migration.",
  fill: colors.blueLight,
  border: colors.blue,
});

section("What I Changed");
bullet([
  "Updated backend/.env so local development hosts are allowed together with the production DigitalOcean host.",
  "Confirmed frontend/.env points Vite to the local Django API: VITE_API_BASE_URL=http://localhost:8000.",
  "Ran the pending Django migration assets.0006_asset_email so the Neon/PostgreSQL assets table matches the current Django model.",
  "Verified the local API after the fix: /health returned 200, /assets returned 200, and CORS allowed http://localhost:5173.",
]);

section("The Main Problem");
paragraph(
  "Django was reachable, but the frontend could not use the data endpoint. A working /health endpoint only proves the server is alive. The frontend needs /assets, and that endpoint failed until the database schema was updated.",
);

codeBlock([
  "Before:",
  "GET http://localhost:8000/health  -> 200 OK",
  "GET http://localhost:8000/assets  -> 500 Internal Server Error",
  "",
  "Database error:",
  "column assets_asset.email does not exist",
]);

codeBlock([
  "Fix applied:",
  "cd backend",
  "python manage.py migrate",
  "",
  "Result:",
  "GET http://localhost:8000/health  -> 200 OK",
  "GET http://localhost:8000/assets  -> 200 OK",
]);

section("Local vs Production");
twoColumnComparison(
  {
    heading: "Running Local",
    body:
      "Frontend runs with Vite on localhost, usually http://localhost:5173. Backend runs with Django runserver on http://localhost:8000. The frontend uses VITE_API_BASE_URL=http://localhost:8000. Django must allow localhost and 127.0.0.1 in DJANGO_ALLOWED_HOSTS. CORS must allow the Vite origin.",
    fill: colors.greenLight,
    border: colors.green,
  },
  {
    heading: "Running on Production",
    body:
      "Backend runs on the deployed domain, for example the DigitalOcean app host. Production must include that domain in DJANGO_ALLOWED_HOSTS. The deployed frontend must use the production backend URL in VITE_API_BASE_URL. Production environment values should be configured in the hosting platform, not committed to Git.",
    fill: colors.amberLight,
    border: colors.amber,
  },
);

section("Important Environment Variables");
bullet([
  "backend/.env: DJANGO_ALLOWED_HOSTS controls which hostnames Django will accept.",
  "backend/.env: BACKEND_CORS_ORIGINS controls which frontend URLs can call the backend from a browser.",
  "frontend/.env: VITE_API_BASE_URL controls where the React app sends API requests.",
  "backend/.env: DATABASE_URL controls which PostgreSQL/Neon database Django uses.",
]);

codeBlock([
  "Local backend example:",
  "DJANGO_ALLOWED_HOSTS=seashell-app-ksiia.ondigitalocean.app,localhost,127.0.0.1,[::1]",
  "BACKEND_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173",
  "",
  "Local frontend example:",
  "VITE_API_BASE_URL=http://localhost:8000",
]);

section("How To Run Locally");
paragraph("Use two terminals: one for Django and one for Vite.");
codeBlock([
  "Terminal 1 - Backend",
  "cd /c/Users/ENVICOMM/Desktop/invent/backend",
  "source .venv/Scripts/activate",
  "python manage.py migrate",
  "python manage.py runserver 8000",
]);
codeBlock([
  "Terminal 2 - Frontend",
  "cd /c/Users/ENVICOMM/Desktop/invent/frontend",
  "npm run dev",
]);

section("How To Verify The Connection");
bullet([
  "Open http://localhost:8000/health. It should show {\"status\": \"ok\"}.",
  "Open http://localhost:8000/assets. It should return JSON data, not a Django error page.",
  "Open the Vite URL, usually http://localhost:5173, then hard refresh with Ctrl + Shift + R.",
  "In the browser Network tab, confirm requests go to http://localhost:8000/assets, not an old /api/tickets/... path.",
]);

section("Plain-English Summary");
paragraph(
  "The frontend and backend were not broken as separate apps. The local backend needed the right local host permissions, and the database needed the latest migration. Once the local host settings and database schema matched the code, the frontend could connect to Django correctly.",
);

footer();

const output = "../Invent_Running_Local_vs_Running_on_Production.pdf";
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")));
console.log(`Generated ${output}`);
