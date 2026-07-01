const fs = require('fs');
let code = fs.readFileSync('components/IncentiveView.tsx', 'utf8');

// Replace the states
const oldStates = `  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAM, setSelectedAM] = useState("");
  const [selectedTL, setSelectedTL] = useState("");
  const [selectedAPH, setSelectedAPH] = useState("");
  const [selectedPH, setSelectedPH] = useState("");
  const [selectedDesig, setSelectedDesig] = useState("");`;

const newStates = `  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [uiConfig, setUiConfig] = useState<{ columns: string[], filters: string[] }>({ columns: [], filters: [] });`;

code = code.replace(oldStates, newStates);

// Remove duplicate columnConfig definition which is leftover
code = code.replace(/  const \[columnConfig, setColumnConfig\] = useState<string\[\]>\(\[\]\);\r?\n/, '');

fs.writeFileSync('components/IncentiveView.tsx', code);
console.log('Fixed state definitions');
