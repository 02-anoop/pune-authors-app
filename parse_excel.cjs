const xlsx = require('xlsx');
const path = require('path');
const file1 = path.join(__dirname, 'src', 'app', 'components', 'data', 'Pune Authors Association Data Base.xlsx');
const workbook1 = xlsx.readFile(file1);
console.log('--- Pune Authors Association Data Base.xlsx ---');
workbook1.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: ${sheetName}`);
    const sheet = workbook1.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        if (data.length > 1) {
            console.log('Sample Row 1:', data[1]);
        }
    }
});

const file2 = path.join(__dirname, 'src', 'app', 'components', 'data', 'Pune Authors Association Data Base (1).xlsx');
const workbook2 = xlsx.readFile(file2);
console.log('\n--- Pune Authors Association Data Base (1).xlsx ---');
workbook2.SheetNames.forEach(sheetName => {
    console.log(`\nSheet: ${sheetName}`);
    const sheet = workbook2.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
        console.log('Headers:', data[0]);
        if (data.length > 1) {
            console.log('Sample Row 1:', data[1]);
        }
    }
});
