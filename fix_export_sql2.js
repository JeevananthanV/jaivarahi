const fs = require('fs');
const content = fs.readFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', 'utf8');

const idx = content.indexOf('const query = ');
const before = content.substring(0, idx);
const after = content.substring(idx);

const oldLine = "const query = `SELECT * FROM `" + "`" + "${config.table}" + "`" + "` WHERE ${where.join(' AND ')} ORDER BY ${config.defaultOrder}`;";

const newLines = "    // Validate ORDER BY clause to prevent SQL injection\n" +
    "    const orderBy = config.defaultOrder;\n" +
    "    if (!/^[\\w\\s,\\.`]+(ASC|DESC)?$/i.test(orderBy)) {\n" +
    "      return res.status(400).json({ error: 'Invalid ORDER BY clause' });\n" +
    "    }\n" +
    "    const query = `SELECT * FROM `" + "`" + "${config.table}" + "`" + "` WHERE ${where.join(' AND ')} ORDER BY ${orderBy}`;";

const newAfter = after.replace(oldLine, newLines);
const newContent = before + newAfter;

fs.writeFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', newContent, 'utf8');
console.log('Done');