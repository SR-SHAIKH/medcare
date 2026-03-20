const fs = require('fs');
const path = require('path');

const API_URL_IMPORT = 'import { API_URL } from ';

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const srcDir = path.join(__dirname, 'client', 'src');
const files = walk(srcDir);
let updatedCount = 0;

files.forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.jsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        // Skip config.js itself
        if (file.endsWith('config.js')) return;

        // Check if file uses the API URL
        if (content.includes('import.meta.env.VITE_API_URL')) {
            // Replace usages
            content = content.replace(/import.meta.env.VITE_API_URL/g, 'API_URL');
            
            // Add import if not present
            if (!content.includes(API_URL_IMPORT)) {
                // Calculate relative path
                const relativePath = path.relative(path.dirname(file), path.join(srcDir, 'config'));
                const importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
                const importLine = `import { API_URL } from "${importPath.replace(/\\/g, '/')}";\n`;
                
                // Add to top of file after other imports or at very top
                content = importLine + content;
            }

            if (content !== original) {
                fs.writeFileSync(file, content);
                console.log('Updated ' + file);
                updatedCount++;
            }
        }
    }
});

console.log(`Finished updating ${updatedCount} files.`);
