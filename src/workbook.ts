import { readFile, utils } from 'xlsx';

// Open workbook
const workbook = readFile('data.xlsx');

// Get sheet names
const firstSheetName = workbook.SheetNames[0];

const secondSheetName = workbook.SheetNames[1];

// Get worksheets
const firstSheet = workbook.Sheets[firstSheetName];

const secondSheet = workbook.Sheets[secondSheetName];

// Find desired cell
let worksheet = firstSheet;

let workingCell = worksheet.A1;

console.log(workingCell.v);

// Find again
worksheet = secondSheet;

workingCell = worksheet.B2;

console.log(workingCell.v);

// Get worksheet range
// assume ws is your worksheet
const range = utils.decode_range(worksheet['!ref'] as string);

const numRows = range.e.r - range.s.r + 1;

const numColumns = range.e.c - range.s.c + 1;

console.log(`Number of rows : ${numRows}\nNumber of columns : ${numColumns}`);
