import fs from 'fs';
const files = [
  'public/assets/css/plugins/bootstrap.min.css',
  'public/assets/css/plugins/animate.min.css',
  'public/assets/css/plugins/magnific-popup.css',
  'public/assets/css/plugins/slick.css',
  'public/assets/css/plugins/slick-theme.css',
  'public/assets/css/plugins/ion.rangeSlider.min.css',
  'public/assets/css/index-critical.css',
  'public/assets/css/style.css',
  'public/assets/css/asta-varahi.css',
  'public/assets/css/about.css',
  'src/pages/payment.css',
  'src/pages/calender.css',
  'src/pages/who_is_varahi.css',
  'src/pages/ashada_navarathiri.css',
  'public/assets/css/responsive.css'
];

let finalCss = '';
for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    finalCss += `/* --- ${file} --- */\n` + content + '\n\n';
  } catch {
    console.warn('Skipping ' + file);
  }
}

fs.writeFileSync('src/index.css', finalCss);
console.log('Done');
