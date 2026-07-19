const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function readAndDump(filePath) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(`\n--- DATA FOR ${path.basename(filePath)} ---`);
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
    console.log(`Total rows: ${data.length}`);
  } catch(e) {
    console.error("Error reading " + filePath, e);
  }
}

const file1 = path.join(__dirname, '..', 'src', 'app', 'data', 'Event_Summary.xlsx');
const file2 = path.join(__dirname, '..', 'src', 'app', 'data', 'author_events.xlsx');

readAndDump(file1);
readAndDump(file2);
