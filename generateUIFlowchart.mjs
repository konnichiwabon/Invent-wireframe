import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF({
  orientation: "landscape",
  unit: "pt",
  format: "a4",
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();

const colors = {
  title: [17, 24, 39],
  text: [31, 41, 55],
  muted: [107, 114, 128],
  border: [148, 163, 184],
  blue: [37, 99, 235],
  blueLight: [219, 234, 254],
  green: [22, 163, 74],
  greenLight: [220, 252, 231],
  amber: [217, 119, 6],
  amberLight: [254, 243, 199],
  red: [220, 38, 38],
  redLight: [254, 226, 226],
  slateLight: [248, 250, 252],
};

function setStroke(rgb = colors.border) {
  doc.setDrawColor(...rgb);
}

function setFill(rgb) {
  doc.setFillColor(...rgb);
}

function setText(rgb = colors.text) {
  doc.setTextColor(...rgb);
}

function box({ x, y, w, h, title, lines = [], fill = colors.slateLight, stroke = colors.border }) {
  setFill(fill);
  setStroke(stroke);
  doc.roundedRect(x, y, w, h, 8, 8, "FD");

  setText(colors.title);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(title, x + 12, y + 17);

  setText(colors.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.3);
  lines.forEach((line, index) => {
    doc.text(line, x + 12, y + 34 + index * 11);
  });
}

function diamond({ x, y, w, h, title, fill = colors.amberLight, stroke = colors.amber }) {
  setFill(fill);
  setStroke(stroke);
  const points = [
    [x + w / 2, y],
    [x + w, y + h / 2],
    [x + w / 2, y + h],
    [x, y + h / 2],
  ];
  doc.lines(
    [
      [w / 2, h / 2],
      [-w / 2, h / 2],
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
    ],
    x + w / 2,
    y,
    [1, 1],
    "FD",
    true,
  );

  setText(colors.title);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const wrapped = doc.splitTextToSize(title, w - 28);
  doc.text(wrapped, x + w / 2, y + h / 2 - (wrapped.length - 1) * 5, {
    align: "center",
    baseline: "middle",
  });
}

function arrow(x1, y1, x2, y2, label) {
  setStroke(colors.border);
  doc.setLineWidth(1.2);
  doc.line(x1, y1, x2, y2);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;
  const left = angle + Math.PI - Math.PI / 7;
  const right = angle + Math.PI + Math.PI / 7;
  doc.line(x2, y2, x2 + Math.cos(left) * size, y2 + Math.sin(left) * size);
  doc.line(x2, y2, x2 + Math.cos(right) * size, y2 + Math.sin(right) * size);

  if (label) {
    setText(colors.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(label, (x1 + x2) / 2, (y1 + y2) / 2 - 5, { align: "center" });
  }
}

function header() {
  setText(colors.title);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Hardware Inventory UI Flowchart", 40, 42);

  setText(colors.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("Generated from the React UI structure in src/App.tsx and related components.", 40, 60);

  setStroke([226, 232, 240]);
  doc.line(40, 72, pageWidth - 40, 72);
}

header();

const start = { x: 60, y: 105, w: 128, h: 58 };
const load = { x: 230, y: 105, w: 142, h: 58 };
const layout = { x: 420, y: 100, w: 166, h: 68 };
const topbar = { x: 635, y: 90, w: 158, h: 78 };
const filter = { x: 635, y: 205, w: 158, h: 58 };
const grid = { x: 420, y: 235, w: 166, h: 76 };
const cards = { x: 220, y: 235, w: 160, h: 76 };
const noResults = { x: 60, y: 245, w: 126, h: 58 };
const viewChoice = { x: 232, y: 360, w: 136, h: 70 };
const specs = { x: 60, y: 468, w: 170, h: 70 };
const edit = { x: 430, y: 455, w: 158, h: 82 };
const add = { x: 635, y: 335, w: 158, h: 75 };
const save = { x: 635, y: 458, w: 158, h: 72 };
const persist = { x: 420, y: 560, w: 166, h: 55 };

box({
  ...start,
  title: "App Start",
  lines: ["Open inventory UI", "Initialize React state"],
  fill: colors.blueLight,
  stroke: colors.blue,
});
box({
  ...load,
  title: "Load Employees",
  lines: ["Read localStorage", "Validate stored data", "Merge default assets"],
});
box({
  ...layout,
  title: "Main Layout",
  lines: ["Fixed sidebar", "Sticky top bar", "Scrollable card grid"],
  fill: colors.greenLight,
  stroke: colors.green,
});
box({
  ...topbar,
  title: "Top Bar Actions",
  lines: ["Search assets", "Filter button", "Department menu", "Add Asset button"],
});
box({
  ...filter,
  title: "Filter State",
  lines: ["Update searchTerm", "Update activeDept", "Recompute results"],
});
box({
  ...grid,
  title: "Filtered Card Grid",
  lines: ["Show matching devices", "Or empty state", "Each card has actions"],
  fill: colors.greenLight,
  stroke: colors.green,
});
box({
  ...cards,
  title: "Inventory Card",
  lines: ["User summary", "Hardware", "Storage", "Network"],
});
box({
  ...noResults,
  title: "No Results",
  lines: ["Displayed when", "filters match no", "devices"],
  fill: colors.redLight,
  stroke: colors.red,
});
diamond({
  ...viewChoice,
  title: "User selects card action?",
});
box({
  ...specs,
  title: "View Full Specs Modal",
  lines: ["Full device details", "Close by X, overlay", "or Escape key"],
  fill: colors.blueLight,
  stroke: colors.blue,
});
box({
  ...edit,
  title: "Edit Device Form",
  lines: ["Pre-filled fields", "Edit identity/system", "RAM/GPU/storage arrays", "Cancel or Save"],
  fill: colors.amberLight,
  stroke: colors.amber,
});
box({
  ...add,
  title: "Add New Device Form",
  lines: ["Blank device template", "Required name/dept", "Add RAM/GPU/storage"],
  fill: colors.amberLight,
  stroke: colors.amber,
});
box({
  ...save,
  title: "Save Device",
  lines: ["If ID exists: update", "If new ID: append", "Close form modal"],
  fill: colors.greenLight,
  stroke: colors.green,
});
box({
  ...persist,
  title: "Persist Inventory",
  lines: ["employees state changes", "Write JSON to localStorage"],
});

arrow(start.x + start.w, start.y + start.h / 2, load.x, load.y + load.h / 2);
arrow(load.x + load.w, load.y + load.h / 2, layout.x, layout.y + layout.h / 2);
arrow(layout.x + layout.w, layout.y + 23, topbar.x, topbar.y + 23);
arrow(topbar.x + topbar.w / 2, topbar.y + topbar.h, filter.x + filter.w / 2, filter.y);
arrow(filter.x, filter.y + filter.h / 2, grid.x + grid.w, grid.y + 20, "updates");
arrow(layout.x + layout.w / 2, layout.y + layout.h, grid.x + grid.w / 2, grid.y);
arrow(grid.x, grid.y + 28, cards.x + cards.w, cards.y + 28, "matches");
arrow(grid.x, grid.y + 55, noResults.x + noResults.w, noResults.y + 28, "empty");
arrow(cards.x + cards.w / 2, cards.y + cards.h, viewChoice.x + viewChoice.w / 2, viewChoice.y);
arrow(viewChoice.x, viewChoice.y + viewChoice.h / 2, specs.x + specs.w, specs.y + 18, "view specs");
arrow(viewChoice.x + viewChoice.w, viewChoice.y + viewChoice.h / 2, edit.x, edit.y + 22, "edit");
arrow(topbar.x + topbar.w / 2, topbar.y + topbar.h, add.x + add.w / 2, add.y, "add asset");
arrow(add.x + add.w / 2, add.y + add.h, save.x + save.w / 2, save.y);
arrow(edit.x + edit.w, edit.y + edit.h / 2, save.x, save.y + 24, "save");
arrow(save.x, save.y + save.h / 2, persist.x + persist.w, persist.y + 20);
arrow(persist.x + persist.w / 2, persist.y, grid.x + grid.w / 2, grid.y + grid.h, "refresh grid");

setText(colors.muted);
doc.setFont("helvetica", "normal");
doc.setFontSize(8);
doc.text("Sidebar nav items are present visually; Assets is the active implemented view in this UI.", 40, pageHeight - 35);

const output = "UI_Flowchart.pdf";
fs.writeFileSync(output, Buffer.from(doc.output("arraybuffer")));
console.log(`Generated ${output}`);
