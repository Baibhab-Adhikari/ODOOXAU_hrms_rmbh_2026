const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.tsx')) {
      callback(p);
    }
  }
}

walk(path.join(process.cwd(), 'src/pages'), (file) => {
  if (file.includes('Dashboard.tsx') || file.includes('SignIn.tsx') || file.includes('SignUp.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Find Topbar import
  content = content.replace(/import\s*{\s*Topbar\s*}\s*from\s*["']@\/components\/Topbar["'];?\n/, '');
  
  // Find Topbar usage and extract title/subtitle
  const topbarRegex = /<Topbar\s+title="([^"]+)"(?:\s+subtitle="([^"]*)")?[^>]*\/>/g;
  
  let updated = false;
  content = content.replace(topbarRegex, (match, title, subtitle) => {
    updated = true;
    let replacement = `      <div className="mb-6">\n        <h1 className="text-2xl font-bold tracking-tight text-foreground">${title}</h1>`;
    if (subtitle) {
      replacement += `\n        <p className="text-muted-foreground mt-1">${subtitle}</p>`;
    }
    replacement += `\n      </div>`;
    return replacement;
  });
  
  if (updated) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
