const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

files.forEach(file => {
  if (file.includes('Dashboard.tsx') || file.includes('SignIn.tsx') || file.includes('SignUp.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // Find Topbar import
  content = content.replace(/import\s*{\s*Topbar\s*}\s*from\s*["']@\/components\/Topbar["'];?\n/, '');
  
  // Find Topbar usage and extract title/subtitle
  const topbarRegex = /<Topbar\s+title="([^"]+)"\s*(?:subtitle="([^"]*)")?[^>]*\/>/;
  const match = content.match(topbarRegex);
  
  if (match) {
    const title = match[1];
    const subtitle = match[2];
    
    let replacement = `      <div className="mb-6">\n        <h1 className="text-2xl font-bold tracking-tight text-foreground">${title}</h1>`;
    if (subtitle) {
      replacement += `\n        <p className="text-muted-foreground mt-1">${subtitle}</p>`;
    }
    replacement += `\n      </div>`;
    
    content = content.replace(topbarRegex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
