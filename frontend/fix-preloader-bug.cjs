const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

let totalFixed = 0;

files.forEach(file => {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  // Match the useEffect block that contains setIsPreloaderHidden
  // Since we know exactly what it looks like
  const badBlockRegex = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?minDisplayTime[\s\S]*?startTime[\s\S]*?finishLoading[\s\S]*?setIsPreloaderHidden[\s\S]*?\}\s*\n?\},?\s*\[\]\);?\s*\n?/g;
  
  if (content.match(badBlockRegex)) {
      content = content.replace(badBlockRegex, '');
      fs.writeFileSync(filepath, content);
      console.log('Fixed', file);
      totalFixed++;
  } else if (content.includes('setIsPreloaderHidden')) {
      // In case the spacing was weird or something, let's try a fallback replace
      const fallbackRegex = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?finishLoading[\s\S]*?setIsPreloaderHidden[\s\S]*?\},?\s*\[\]\);?\s*\n?/g;
      if (content.match(fallbackRegex)) {
          content = content.replace(fallbackRegex, '');
          fs.writeFileSync(filepath, content);
          console.log('Fixed (fallback)', file);
          totalFixed++;
      } else {
        console.log('Could not match regex for', file);
      }
  }
});

console.log(`Total fixed: ${totalFixed}`);
