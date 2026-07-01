const fs = require('fs');

let code = fs.readFileSync('app/api/incentives/service.ts', 'utf8');

// Split into lines (normalize line endings)
const lines = code.replace(/\r\n/g, '\n').split('\n');

// Find the first occurrence of "// 5. Apply Group By from UI"
let firstGroupByLine = -1;
let secondGroupByLine = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('// 5. Apply Group By from UI')) {
        if (firstGroupByLine === -1) firstGroupByLine = i;
        else { secondGroupByLine = i; break; }
    }
}

console.log('First groupBy line:', firstGroupByLine);
console.log('Second groupBy line:', secondGroupByLine);

if (secondGroupByLine === -1) {
    console.log('No duplicate found. File may already be clean.');
    process.exit(0);
}

// Also find where is_special etc. are missing (lines 563-570 end early)
// We need to: remove lines from (firstGroupByLine - duplicate push block start) to (secondGroupByLine - 1)
// But more precisely: remove from the broken "}" after salary = ... on line 570 to the duplicate secondGroupByLine
// 
// Strategy: keep everything up to and including line (secondGroupByLine-1), 
// but inject the missing lines from is_special to payment_mode first,
// then continue from secondGroupByLine

// Find where the first groupedData "if (groupBy === employee_code" block ends broken
// Look for the partial end around line 570
let brokenEnd = -1;
for (let i = firstGroupByLine - 1; i >= firstGroupByLine - 30; i--) {
    if (lines[i].includes("groupedData[groupKey].salary = res.salary;") && !lines[i+1].includes("is_special")) {
        brokenEnd = i;
        break;
    }
}
console.log('Broken end (salary line without is_special after):', brokenEnd);

// Build the fixed ending
const missingLines = [
                "                groupedData[groupKey].is_special = res.is_special;",
                "                groupedData[groupKey].tl_name = res.tl_name;",
                "                groupedData[groupKey].am_name = res.am_name;",
                "                groupedData[groupKey].aph = res.aph;",
                "                groupedData[groupKey].ph = res.ph;",
                "                groupedData[groupKey].bucket = res.bucket;",
                "                groupedData[groupKey].payment_mode = res.payment_mode;",
];

// Build the new file:
// Take lines 0..brokenEnd (inclusive)
// + missing lines
// + close the if and for: "            }" and "        }"
// + then from secondGroupByLine to end

const before = lines.slice(0, brokenEnd + 1);
const after = lines.slice(secondGroupByLine);

const closingBraces = [
    "            }",  // closes if (groupBy === ...)
    "        }",      // closes for (const res of calculatedResults)
    "",
];

const newLines = [...before, ...missingLines, ...closingBraces, ...after];
fs.writeFileSync('app/api/incentives/service.ts', newLines.join('\n'));
console.log('Fixed! New file has', newLines.length, 'lines.');
