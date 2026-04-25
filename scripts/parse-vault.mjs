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
  // Enhanced markdown parsing for fallback/indexing
  let html = content;

  // Clean up existing markdown features to prevent double-wrapping
  html = html.replace(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g, (match, id, label) => {
    const targetId = id.toLowerCase().replace(/\s+/g, '_');
    return `<span class="wiki-link" data-id="${targetId}">${label || id}</span>`;
  });

  return html;
}

const files = walk(VAULT_PATH);
const researchData = {
  nodes: [],
  links: [],
  files: {}
};

const tagToGroup = {
  'ai': 'ai', 'intelligence': 'ai', 'agent': 'ai',
  'ml': 'ml', 'pinn': 'ml',
  'physics': 'physics', 'pde': 'physics',
  'systems': 'systems', 'kernel': 'systems',
  'security': 'security', 'fraud': 'security',
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
    description: data.description || '',
    tags: tags
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
