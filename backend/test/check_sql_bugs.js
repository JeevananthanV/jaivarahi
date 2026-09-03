import fs from 'fs';

const content = fs.readFileSync('./backend/admin-routes.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (/WHERE.*WHERE/i.test(line) || /WHERE.*\$\{dateClause\}/i.test(line)) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
