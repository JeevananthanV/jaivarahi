const fs = require('fs');
const content = fs.readFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', 'utf8');

// Find and replace the exact line
const oldLine = "const query = `SELECT * FROM \\`${config.table}\\` WHERE ${where.join(' AND ')} ORDER BY ${config.defaultOrder}`;";

const newLines = "    // Validate ORDER BY clause to prevent SQL injection\n" +
    "    const orderBy = config.defaultOrder;\n" +
    "    if (!/^[\\w\\s,\\.`]+(ASC|DESC)?$/i.test(orderBy)) {\n" +
    "      return res.status(400).json({ error: 'Invalid ORDER BY clause' });\n" +
    "    }\n" +
    "    const query = `SELECT * FROM \\`${config.table}\\` WHERE ${where.join(' AND ')} ORDER BY ${orderBy}`;";

if (content.includes(oldLine)) {
  const newContent = content.replace(oldLine, newLines);
  fs.writeFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', newContent, 'utf8');
  console.log('Done - replaced');
} else {
  console.log('Old line not found exactly');
  // Show what's there
  const idx = content.indexOf('const query = ');
  console.log('Found:', JSON.stringify(content.substring(idx, idx + 120)));
}