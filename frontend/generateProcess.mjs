import { jsPDF } from 'jspdf';
import fs from 'fs';

const doc = new jsPDF();

doc.setFontSize(16);
doc.text("PDF Implementation Process", 20, 20);

doc.setFontSize(12);
doc.text("Libraries Downloaded:", 20, 40);
doc.setFontSize(10);
doc.text("- jspdf: The core library used for generating PDF documents from JavaScript.", 20, 50);
doc.text("- jspdf-autotable: A plugin for jsPDF that handles drawing and formatting data tables.", 20, 60);

doc.setFontSize(12);
doc.text("The Step-by-Step Process:", 20, 80);

doc.setFontSize(10);
const processText = [
  "1. Library Installation: I used the Node Package Manager (npm) to download and install both",
  "   'jspdf' and 'jspdf-autotable' into the project.",
  "",
  "2. PDF Document Setup: I created a utility function that initializes a new PDF document.",
  "   Because there are 28 fields, I configured the PDF to be in landscape orientation and",
  "   used an A3 page size to ensure all the columns would fit without overlapping.",
  "",
  "3. Data Structuring: I mapped over the employee data to extract the 28 required fields.",
  "   For fields that can have multiple items (like RAM sticks, Storage drives, and GPUs),",
  "   I programmed it to combine all the items using line breaks so they display neatly",
  "   inside a single cell for that specific employee.",
  "",
  "4. Table Generation: I fed the structured headers and the mapped employee data into",
  "   the 'autotable' plugin. I customized the table theme by coloring the headers dark",
  "   blue (to match the web app's theme), reducing the font size, and enabling automatic",
  "   line breaking for long text.",
  "",
  "5. Interface Integration: Finally, I updated the main application interface by adding",
  "   an 'Export PDF' button to the toolbar. This button takes whatever list of devices",
  "   is currently filtered on your screen and triggers the utility function to download",
  "   the customized PDF file to your computer."
];

doc.text(processText, 20, 90);

// Save the PDF using fs
const arrayBuffer = doc.output('arraybuffer');
fs.writeFileSync('../PDF_Implementation_Process.pdf', Buffer.from(arrayBuffer));

console.log('PDF generated successfully!');
