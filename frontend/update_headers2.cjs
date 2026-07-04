const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/pages/**/*.tsx');

files.forEach(file => {
  if (file.includes('Dashboard.tsx') || file.includes('SignIn.tsx') || file.includes('SignUp.tsx')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  const start = content.indexOf('<Topbar ');
  if (start !== -1) {
    const end = content.indexOf('/>', start);
    if (end !== -1) {
      const topbarStr = content.substring(start, end + 2);
      
      let title = "";
      let subtitle = "";
      
      const titleMatch = topbarStr.match(/title="([^"]+)"/);
      if (titleMatch) title = titleMatch[1];
      
      const subMatch = topbarStr.match(/subtitle="([^"]+)"/);
      if (subMatch) subtitle = subMatch[1];
      
      let replacement = `      <div className="mb-6">\n        <h1 className="text-2xl font-bold tracking-tight text-foreground">${title}</h1>`;
      if (subtitle) replacement += `\n        <p className="text-muted-foreground mt-1">${subtitle}</p>`;
      replacement += `\n      </div>`;
      
      content = content.replace(topbarStr, replacement);
      
      // Remove import
      content = content.replace(/import\s*{\s*Topbar\s*}\s*from\s*["']@\/components\/Topbar["'];?\n/, '');
      
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated', file);
    }
  }
});
