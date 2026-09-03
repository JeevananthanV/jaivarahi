const fs = require('fs');
const glob = require('fast-glob');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

async function processCSS() {
    const cssPath = 'public/assets/css/style.css';
    const css = fs.readFileSync(cssPath, 'utf8');

    // Find all JSX files
    const jsxFiles = glob.sync(['src/**/*.jsx', 'index.html']);
    let allContent = '';
    for (const file of jsxFiles) {
        allContent += fs.readFileSync(file, 'utf8') + '\n';
    }

    // A simple regex to extract all possible class names from JSX/HTML
    const classMatches = allContent.match(/[a-zA-Z0-9_-]+/g) || [];
    const usedClasses = new Set(classMatches);
    // Add dynamically used classes common in Bootstrap or apps
    ['active', 'show', 'fade', 'collapse', 'collapsing', 'modal-backdrop', 'slick-active', 'slick-current', 'animated', 'fadeIn', 'fadeInUp', 'slideInLeft', 'slideInRight', 'zoomIn', 'nav-link', 'dropdown-menu', 'slick-slide', 'slick-track', 'slick-list', 'form-control', 'btn', 'shadow', 'sticky-top'].forEach(c => usedClasses.add(c));

    const checkSelector = selectorParser(selectors => {
        let isUsed = false;
        selectors.walkClasses(node => {
            if (usedClasses.has(node.value)) isUsed = true;
        });
        
        selectors.walkTags(node => {
             // If a selector has no classes and only tags (like p, h1, body), keep it
             if (['html', 'body', 'div', 'span', 'applet', 'object', 'iframe', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'a', 'abbr', 'acronym', 'address', 'big', 'cite', 'code', 'del', 'dfn', 'em', 'img', 'ins', 'kbd', 'q', 's', 'samp', 'small', 'strike', 'strong', 'sub', 'sup', 'tt', 'var', 'b', 'u', 'i', 'center', 'dl', 'dt', 'dd', 'ol', 'ul', 'li', 'fieldset', 'form', 'label', 'legend', 'table', 'caption', 'tbody', 'tfoot', 'thead', 'tr', 'th', 'td', 'article', 'aside', 'canvas', 'details', 'embed', 'figure', 'figcaption', 'footer', 'header', 'hgroup', 'menu', 'nav', 'output', 'ruby', 'section', 'summary', 'time', 'mark', 'audio', 'video'].includes(node.value) && selectors.nodes.length === 1 && selectors.nodes[0].nodes.length === 1) {
                 isUsed = true;
             }
        });
        
        // Pseudo elements and attributes can be complex, default to true if they are standalone
        if (selectors.length > 0 && Array.from(selectors.nodes[0].nodes).every(n => n.type !== 'class')) {
            isUsed = true;
        }

        return isUsed;
    });

    const isRuleUsed = (rule) => {
        if (!rule.selector) return true;
        // Check if any comma-separated selector is used
        const selectors = rule.selector.split(',').map(s => s.trim());
        const validSelectors = [];

        for (const sel of selectors) {
            let used = false;
            if (sel.includes(':root') || sel === '*') validSelectors.push(sel);
            else {
                checkSelector.astSync(sel, { lossless: false });
                // We do a manual check for simplicity here
                const classesInSel = sel.match(/\.([a-zA-Z0-9_-]+)/g);
                if (!classesInSel) {
                    validSelectors.push(sel); // Keep tag and id selectors
                } else {
                    const allUsed = classesInSel.every(c => usedClasses.has(c.substring(1)));
                    if (allUsed) validSelectors.push(sel);
                }
            }
        }
        
        if (validSelectors.length > 0) {
            rule.selector = validSelectors.join(', ');
            return true;
        }
        return false;
    };

    const root = postcss.parse(css);

    // Filter rules
    root.walkRules(rule => {
        if (!isRuleUsed(rule)) {
            rule.remove();
        }
    });

    // Categorization
    const variablesAndResets = postcss.root();
    const baseTypography = postcss.root();
    const layoutComponents = postcss.root();
    const utilityState = postcss.root();
    const mediaQueries = postcss.root();
    const others = postcss.root();

    root.each(node => {
        if (node.type === 'atrule' && node.name === 'media') {
            node.walkRules(r => {
                if (!isRuleUsed(r)) r.remove();
            });
            if (node.nodes.length > 0) mediaQueries.append(node);
        } else if (node.type === 'atrule' && node.name === 'keyframes') {
            baseTypography.append(node);
        } else if (node.type === 'rule') {
            const sel = node.selector;
            if (sel.includes(':root') || sel.startsWith('*') || sel === 'html' || sel === 'body') {
                variablesAndResets.append(node);
            } else if (sel.match(/^[a-zA-Z]/) && !sel.includes('.')) {
                baseTypography.append(node);
            } else if (sel.match(/\.(text-|bg-|margin-|padding-|active|hover|focus|d-|flex-|justify-|align-|m-|p-)/)) {
                utilityState.append(node);
            } else if (sel.startsWith('.')) {
                layoutComponents.append(node);
            } else {
                others.append(node);
            }
        } else if (node.type === 'comment') {
            // Drop comments to keep it clean or ignore
        }
    });

    // Reconstruct
    let finalCSS = '/* 1. Variables & Resets (:root) */\n\n' + variablesAndResets.toString() + '\n\n';
    finalCSS += '/* 2. Base Typography & Global Elements */\n\n' + baseTypography.toString() + '\n\n';
    finalCSS += '/* 3. Layout Components (The "Shell") */\n\n' + layoutComponents.toString() + '\n\n';
    finalCSS += '/* 4. Utility & State Classes */\n\n' + utilityState.toString() + '\n\n';
    finalCSS += '/* 5. Media Queries (Responsive Design) */\n\n' + mediaQueries.toString() + '\n\n';
    finalCSS += '/* Others */\n\n' + others.toString() + '\n';

    fs.writeFileSync(cssPath, finalCSS);
    console.log('Successfully refactored style.css');
}

processCSS().catch(console.error);
