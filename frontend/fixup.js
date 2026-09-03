import fs from 'fs';

let css = fs.readFileSync('src/index.css', 'utf8');

// 1. Fix Root Variables
css = css.replace(/--primary-color:\s*var\(--primary-color\);/, '--primary-color: #9a3b34;');
css = css.replace(/--secondary-color:\s*var\(--secondary-color\);/, '--secondary-color: #663333;');
css = css.replace(/--accent-color:\s*var\(--accent-color\);/, '--accent-color: #e85a4f;');
css = css.replace(/--text-color:\s*var\(--text-color\);/, '--text-color: #333333;');
css = css.replace(/--text-strong:\s*var\(--text-strong\);/, '--text-strong: #222222;');
css = css.replace(/--text-emphasis:\s*var\(--text-emphasis\);/, '--text-emphasis: #800000;');
css = css.replace(/--background-light:\s*var\(--background-light\);/, '--background-light: #f8f8f8;');
css = css.replace(/--background-medium:\s*var\(--background-medium\);/, '--background-medium: #e6e6e6;');
css = css.replace(/--background-dark:\s*var\(--background-dark\);/, '--background-dark: wheat;');

// 2. Fix images URLs
// E.g., url(../img/...) -> url(/assets/img/...)
css = css.replace(/url\(['"]?(?:\.\.\/|\.\/|assets\/)*img\/([^'"\)]*)['"]?\)/g, 'url("/assets/img/$1")');

fs.writeFileSync('src/index.css', css);
console.log('Fixed variables and images');
