import fs from 'fs';
import postcss from 'postcss';
import fg from 'fast-glob';
const globSync = fg.globSync;

const cssPath = 'src/index.css';
const css = fs.readFileSync(cssPath, 'utf8');

const root = postcss.parse(css);

const buckets = {
    globals: postcss.root(),
    variables: postcss.root(),
    reset: postcss.root(),
    typography: postcss.root(),
    layout: postcss.root(),
    components: postcss.root(),
    sections: postcss.root(),
    utilities: postcss.root(),
    responsive: postcss.root(),
};

// Colors mapping to convert to variables
const colorVars = {
    '#9a3b34': 'var(--primary-color)',
    '#663333': 'var(--secondary-color)',
    '#e85a4f': 'var(--accent-color)',
    '#333': 'var(--text-color)',
    '#333333': 'var(--text-color)',
    '#222222': 'var(--text-strong)',
    '#800000': 'var(--text-emphasis)',
    '#f8f8f8': 'var(--background-light)',
    '#e6e6e6': 'var(--background-medium)',
    'wheat': 'var(--background-dark)'
};

// Deduplicate rules by string representation and apply CSS variables automatically
const uniqueRules = new Set();

// Extract unused CSS based strictly on what's visible in JSX files.
const allContent = globSync(['src/**/*.{jsx,js,tsx}', 'index.html']).map(f => fs.readFileSync(f, 'utf8')).join(' ');
const classMatches = allContent.match(/[a-zA-Z0-9_-]+/g) || [];
const usedClasses = new Set(classMatches);
// Add common vendor/utility dynamically added classes to a whitelist
const whitelist = ['active', 'show', 'fade', 'collapse', 'collapsing', 'modal', 'modal-backdrop', 'slick-active', 'slick-current', 'animated', 'nav-link', 'dropdown-menu', 'slick-slide', 'slick-track', 'slick-list', 'form-control', 'btn', 'shadow', 'sticky-top', 'loader', 'loaded', 'container', 'row', 'col-', 'd-none', 'd-block'];

whitelist.forEach(w => usedClasses.add(w));

const isUsed = (sel) => {
    // If it's not a class selector or id selector, keep it.
    if (!sel.includes('.')) return true;
    
    // Check all classes in the selector
    const classesMatch = sel.match(/\.([a-zA-Z0-9_-]+)/g);
    if (!classesMatch) return true; // Could be tags alone

    // If it's a structural col class, keep it
    if (classesMatch.some(c => c.startsWith('.col-'))) return true;
    
    // Check if at least one class is potentially used (or whitelist).
    return classesMatch.some(c => {
        const className = c.substring(1);
        if (usedClasses.has(className)) return true;
        if (whitelist.some(w => className.includes(w))) return true;
        return false;
    });
};

root.walkComments(c => c.remove());

// Colors transformation
root.walkDecls(decl => {
    for (const [hex, cssVar] of Object.entries(colorVars)) {
        // Simple case-insensitive match for hex values
        const regex = new RegExp(hex, 'i');
        if (decl.value && decl.value.match(regex)) {
            decl.value = decl.value.replace(regex, cssVar);
        }
    }
});

// Pre-filter unused rules and empty rules
root.walkRules(rule => {
    if (rule.selector) {
        // Keep keyframes untouched
        if (rule.parent && rule.parent.type === 'atrule' && rule.parent.name === 'keyframes') return;

        // Strip unused from multiple selectors separated by comma
        const selectorsList = rule.selector.split(',').map(s => s.trim());
        const validSelectors = selectorsList.filter(isUsed);
        
        if (validSelectors.length === 0) {
            rule.remove();
        } else {
            rule.selector = validSelectors.join(', ');
        }
    }
});

root.each(node => {
    if (node.type === 'atrule' && (node.name === 'media' || node.name === 'supports' || node.name === 'container')) {
        buckets.responsive.append(node);
    } else if (node.type === 'atrule' && node.name && node.name.includes('keyframes')) {
        buckets.components.append(node);
    } else if (node.type === 'atrule') {
        // import, font-face, etc.
        if (node.name === 'charset' || node.name === 'import') {
            buckets.globals.append(node);
        } else {
            buckets.reset.prepend(node);
        }
    } else if (node.type === 'rule') {
        const sel = node.selector;
        
        // Very basic deduplication -> convert rule to string without formatting, limit to exact match
        const ruleStr = node.toString().replace(/\\s+/g, ' ');
        if (uniqueRules.has(ruleStr)) {
             return; // Skip duplicate
        }
        uniqueRules.add(ruleStr);

        if (sel.includes(':root') || sel.includes('::-webkit-scrollbar')) {
            buckets.variables.append(node);
        } else if (sel.match(/^(\\*|html|body|main)$/) || (sel.match(/^[a-zA-Z_-]+(\\s*,\\s*[a-zA-Z_-]+)*$/) && !sel.includes('.'))) {
            // It's a pure tag selector or list of tags
            if (sel.match(/^(h[1-6]|p|a|blockquote|cite|label|strong|b|small|ul|li|ol|span)$/)) {
                buckets.typography.append(node);
            } else {
                buckets.reset.append(node);
            }
        } else if (sel.match(/\\.(container|row|col-|header|footer|wrapper|site-container|sigma_header|sigma_footer)/) || sel.match(/^(header|footer|nav)/)) {
            buckets.layout.append(node);
        } else if (sel.match(/\\.(sigma_banner|section|hero|about|services|gallery|blog|testimonial|contact|pricing|slider)/)) {
            buckets.sections.append(node);
        } else if (sel.match(/\\.(m-|p-|mt-|mb-|ml-|mr-|pt-|pb-|pl-|pr-|text-|bg-|d-|flex-|justify-|align-|opacity-|border|w-|h-|fs-|fw-|icon-|z-index-|transform-|custom-)/)) {
            buckets.utilities.append(node);
        } else {
            // Fallback for everything else goes to components
            buckets.components.append(node);
        }
    }
});

let finalCSS = `@charset "UTF-8";\n\n`;

// Format imports properly
buckets.globals.each(node => {
    if (node.name === 'import') {
        finalCSS += `@import ${node.params};\n`;
    }
});

finalCSS += `\n/* =========================\n1. CSS VARIABLES (ROOT)\n========================= */\n\n${buckets.variables.toString()}\n\n`;
finalCSS += `/* =========================\n2. RESET / BASE STYLES\n========================= */\n\n${buckets.reset.toString()}\n\n`;
finalCSS += `/* =========================\n3. TYPOGRAPHY\n========================= */\n\n${buckets.typography.toString()}\n\n`;
finalCSS += `/* =========================\n4. LAYOUT (header, footer, container, grid)\n========================= */\n\n${buckets.layout.toString()}\n\n`;
finalCSS += `/* =========================\n5. COMPONENTS\n(buttons, cards, navbar, forms, etc.)\n========================= */\n\n${buckets.components.toString()}\n\n`;
finalCSS += `/* =========================\n6. SECTIONS\n(hero, about, services, gallery, etc.)\n========================= */\n\n${buckets.sections.toString()}\n\n`;
finalCSS += `/* =========================\n7. UTILITIES\n(margin, padding, flex helpers)\n========================= */\n\n${buckets.utilities.toString()}\n\n`;
finalCSS += `/* =========================\n8. RESPONSIVE DESIGN\n========================= */\n\n${buckets.responsive.toString()}\n\n`;

fs.writeFileSync('src/index.css', finalCSS);
console.log('Successfully refactored index.css');
