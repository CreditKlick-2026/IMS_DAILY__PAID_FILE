const fs = require('fs');
const filePath = 'app/dashboard/rules-engine/clients/page.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const targetStr = `<option value="grid_1">Master Grid 1</option>
                <option value="grid_2">Master Grid 2</option>`;
const replacementStr = `<option value="grid_1">Master Grid 1</option>
                <option value="grid_2">Master Grid 2</option>
                <option value="grid_3">Master Grid 3</option>`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    fs.writeFileSync(filePath, code);
    console.log('Added Master Grid 3 to dropdown!');
} else {
    // try regex just in case of CRLF
    const regex = /<option value="grid_1">Master Grid 1<\/option>\s*<option value="grid_2">Master Grid 2<\/option>/g;
    code = code.replace(regex, `<option value="grid_1">Master Grid 1</option>\n                <option value="grid_2">Master Grid 2</option>\n                <option value="grid_3">Master Grid 3</option>`);
    fs.writeFileSync(filePath, code);
    console.log('Added Master Grid 3 to dropdown using regex!');
}
