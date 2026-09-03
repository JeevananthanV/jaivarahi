const fs = require('fs');
const path = require('path');

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filepath = path.join(dir, file);
  let content = fs.readFileSync(filepath, 'utf8');

  let madeChanges = false;

  // Add Preloader import if missing
  if (!content.includes('../components/common/Preloader.jsx')) {
    content = content.replace(/(import.*?\n)(?!.*import)/, '$1import Preloader from \'../components/common/Preloader.jsx\'\n');
    madeChanges = true;
  }

  // Add FloatActions import if missing
  if (!content.includes('../components/common/FloatActions.jsx')) {
    content = content.replace(/(import.*?\n)(?!.*import)/, '$1import FloatActions from \'../components/common/FloatActions.jsx\'\n');
    madeChanges = true;
  }

  // Inject <Preloader /> right after <Helmet> or <Navbar or at start of return (<> if missing
  if (!content.includes('<Preloader') && !content.includes('Preloader />')) {
      content = content.replace(/(<Helmet>[\s\S]*?<\/Helmet>)\s*/, '$1\n      <Preloader />\n');
      if (!content.includes('<Preloader')) {
          content = content.replace(/(<Navbar[\s\S]*?\/>)\s*/, '<Preloader />\n      $1\n');
      }
      madeChanges = true;
  }

  // Remove isPreloaderHidden state and useEffect
  if (content.match(/const\s+\[isPreloaderHidden,\s*setIsPreloaderHidden\]\s*=\s*useState\(.*?\)/)) {
      content = content.replace(/const\s+\[isPreloaderHidden,\s*setIsPreloaderHidden\]\s*=\s*useState\(.*?\)/, '');
      
      // Attempt to remove the finishLoading useEffect roughly
      // We will just replace `<Preloader hidden={isPreloaderHidden} />` with `<Preloader />`
      content = content.replace(/<Preloader\s+hidden=\{isPreloaderHidden\}\s*\/>/g, '<Preloader />');
      madeChanges = true;
  }

  // Inject <FloatActions /> right before <Footer />
  if (!content.includes('<FloatActions />') && !content.includes('<FloatActions/>')) {
    if (content.includes('<Footer />')) {
        content = content.replace(/<Footer \/>/, '<FloatActions />\n      <Footer />');
    } else {
        content = content.replace('</>', '      <FloatActions />\n    </>');
    }
    madeChanges = true;
  }

  // Remove explicit whatsapp float
  if (content.includes('whatsapp-float')) {
    content = content.replace(/<a[^>]*?\bwhatsapp-float\b[^>]*>[\s\S]*?<\/a>/g, '');
    madeChanges = true;
  }

  // Remove explicit sigma_top
  if (content.includes('sigma_top')) {
    content = content.replace(/<a[^>]*?\bsigma_top\b[^>]*>[\s\S]*?<\/a>/g, '');
    madeChanges = true;
  }

  // Remove embedded inline jaivarahi-preloader
  if (content.includes('jaivarahiPreloader') || content.includes('jaivarahi-preloader')) {
    content = content.replace(/<div(?:[^>]*\bid=["']jaivarahiPreloader["'][^>]*|[^>]*\bclassName=["'][^"']*jaivarahi-preloader[^"']*["'][^>]*)>[\s\S]*?<div\b[^>]*\bmantra\b[^>]*>[\s\S]*?<\/div>\s*<\/div>/, '');
    madeChanges = true;
  }

  if (madeChanges) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Refactored: ${file}`);
  }
}

console.log('All pages processed');
