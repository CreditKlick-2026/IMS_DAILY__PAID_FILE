const fs = require('fs');
const path = require('path');

const locations = ['uttam-nagar', 'gurugram', 'pune', 'delhi'];

for (const loc of locations) {
    const filePath = path.join('app', 'dashboard', 'incentive', loc, 'page.tsx');
    if (!fs.existsSync(filePath)) continue;

    let content = fs.readFileSync(filePath, 'utf-8');

    const oldExcel = `  const downloadExcel = () => {
    if (filteredData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incentives");
    const filename = \`Incentives_\${filterMonth || 'All'}_\${filterYear || 'All'}.xlsx\`;
    XLSX.writeFile(wb, filename);
  };`;

    const newExcel = `  const downloadExcel = () => {
    const excelData = filteredData.filter((d: any) => d.assigned_grid && d.assigned_grid !== 'No Plan Matched');
    if (excelData.length === 0) {
        alert("No valid data or grid assigned to download.");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incentives");
    const filename = \`Incentives_\${filterMonth || 'All'}_\${filterYear || 'All'}.xlsx\`;
    XLSX.writeFile(wb, filename);
  };`;

    if (content.includes(oldExcel)) {
        content = content.replace(oldExcel, newExcel);
        fs.writeFileSync(filePath, content);
        console.log("Updated excel logic in " + filePath);
    } else {
        // Try slightly more flexible replacement
        const oldExcelFlexible = /const downloadExcel = \(\) => {[\s\S]*?XLSX\.writeFile\(wb, filename\);\n  };/;
        if (oldExcelFlexible.test(content)) {
            content = content.replace(oldExcelFlexible, newExcel);
            fs.writeFileSync(filePath, content);
            console.log("Updated excel logic (flexible match) in " + filePath);
        } else {
            console.log("Could not find old excel logic in " + filePath);
        }
    }
}
