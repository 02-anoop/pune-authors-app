const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const file2 = path.join(__dirname, '..', 'src', 'app', 'data', 'author_events.xlsx');
const workbook = xlsx.readFile(file2);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
console.log(Object.keys(data[0]));
