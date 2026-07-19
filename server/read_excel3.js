const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '..', 'src', 'app', 'data', 'Event_Summary.xlsx');
const workbook = xlsx.readFile(file1);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
data.forEach((e, i) => console.log(`${i+1}: ${e['Event Date']} - ${e['Event Name']}`));
