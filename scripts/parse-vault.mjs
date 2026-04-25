import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const VAULT_PATH = process.env.VAULT_PATH || './vault';
const OUTPUT_FILE = './src/data/research.json';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.md')) {
      results.push(file);
    }
  });
  return results;
}

function parseMarkdown(content) {
  // Simple markdown to HTML conversion for the garden
  let html = content;

  // Headers
  html = html.replace(/^# (.*$)/gm, '<div class="font-serif text-[24px] font-medium mb-4 text-ink">$1</div>');
  html = html.replace(/^## (.*$)/gm, '<div class="font-serif text-[20px] font-medium mb-3 mt-6 text-ink">$1</div>');
  html = html.replace(/^### (.*$)/gm, '<div class="font-serif text-[18px] font-medium mb-2 mt-4 text-ink">$1</div>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italics
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Wikilinks [[id|label]] or [[id]]
  html = html.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '<span class="wiki-link" data-id="$1">$2</span>');
  html = html.replace(/\[\[([^\]]+)\]\]/g, '<span class="wiki-link" data-id="$1">$1</span>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<code class="font-mono text-[13px] bg-[rgba(0,71,255,0.04)] border-l-2 border-accent px-4 py-3 my-4 text-ink block whitespace-pre-wrap">$1</code>');
  
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="font-mono text-[12px] bg-accent-light px-1.5 py-0.5 rounded text-accent">$1</code>');

  // Lists
  html = html.replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>');
  
  // Paragraphs
  html = html.replace(/^(?!<div|<li|<code|<ul|<ol)(.+)$/gm, '<p class="mb-3">$1</p>');

  return `<div class="font-serif text-[15px] leading-[1.8] text-ink-muted">${html}</div>`;
}

const files = walk(VAULT_PATH);
const researchData = {
  nodes: [],
  links: [],
  files: {}
};

const tagToGroup = {
  'ml': 'ml', 'pinn': 'ml', 'ai': 'ml',
  'physics': 'physics', 'pde': 'physics',
  'systems': 'systems', 'kernel': 'systems',
  'security': 'security', 'agent': 'security',
  'saas': 'saas', 'product': 'saas',
  'concept': 'concept'
};

const groupToColor = {
  'ml': '#0047FF',
  'physics': '#0F6E56',
  'systems': '#534AB7',
  'security': '#3B6D11',
  'saas': '#BA7517',
  'concept': '#FFBD2E',
  'general': '#BDBDBD'
};

files.forEach(filePath => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const id = path.basename(filePath, '.md').toLowerCase().replace(/\s+/g, '_');
  
  const tags = data.tags || [];
  const primaryTag = tags.find(t => tagToGroup[t]) || 'general';
  const group = tagToGroup[primaryTag] || 'general';
  const color = groupToColor[group];

  researchData.nodes.push({
    id: id,
    name: data.title || path.basename(filePath, '.md'),
    group: group,
    color: color,
    description: data.description || ''
  });

  researchData.files[id] = {
    title: data.title || path.basename(filePath, '.md'),
    header: path.relative(VAULT_PATH, filePath),
    markdown: content,
    html: parseMarkdown(content) // Keep fallback but prioritize markdown
  };

  // Extract links
  const linkMatches = content.matchAll(/\[\[([^|\]]+)(?:\|[^\]]+)?\]\]/g);
  for (const match of linkMatches) {
    const targetId = match[1].toLowerCase().replace(/\s+/g, '_');
    researchData.links.push({
      source: id,
      target: targetId
    });
  }
});

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(researchData, null, 2));
console.log(`Successfully processed ${files.length} files into ${OUTPUT_FILE}`);
