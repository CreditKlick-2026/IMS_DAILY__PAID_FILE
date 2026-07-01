const fs = require('fs');

const files = [
  'app/dashboard/incentive/gurugram/page.tsx',
  'app/dashboard/incentive/uttam-nagar/page.tsx',
  'app/dashboard/incentive/delhi/page.tsx',
  'app/dashboard/incentive/pune/page.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Fix the extra closing tags
  const badTags1 = \`        </div>
        </div>

        </div>
        </div>

        {/* Pagination */}\`;
        
  const badTags2 = \`</div>
        </div>

        </div>
        </div>

        {/* Pagination */}\`;

  const goodTags = \`        </div>
        </div>

        {/* Pagination */}\`;

  content = content.replace(badTags1, goodTags);
  content = content.replace(badTags2, goodTags);
  
  // also handle the case where it's just repeating
  content = content.replace(/<\/div>\\s*<\/div>\\s*<\/div>\\s*<\/div>\\s*\{\/\* Pagination \*\/\}/g, \`</div>\n        </div>\n\n        {/* Pagination */}\`);

  fs.writeFileSync(file, content);
  console.log("Cleaned up closing tags in " + file);
});
