// Comprehensive test of the parseTextAdventure function
const fs = require('fs');

// Read the test file
const text = fs.readFileSync('test-standalone-numbers.txt', 'utf-8');

console.log("=== PARSING TEST ===\n");
console.log("Input text length:", text.length);
console.log("First 200 chars:", text.substring(0, 200));

// Extract metadata
let title = 'Untitled Adventure';
let author = '';
let description = '';
let skill = 8, stamina = 20, luck = 9;

const titleMatch = text.match(/(?:Title|TITLE|Adventure):\s*(.+)/i);
if (titleMatch) title = titleMatch[1].trim();

const authorMatch = text.match(/(?:Author|By):\s*(.+)/i);
if (authorMatch) author = authorMatch[1].trim();

const descMatch = text.match(/(?:Description|Summary):\s*(.+)/i);
if (descMatch) description = descMatch[1].trim();

const skillMatch = text.match(/(?:Initial\s+)?SKILL:\s*(\d+)/i);
if (skillMatch) skill = parseInt(skillMatch[1]);

const staminaMatch = text.match(/(?:Initial\s+)?STAMINA:\s*(\d+)/i);
if (staminaMatch) stamina = parseInt(staminaMatch[1]);

const luckMatch = text.match(/(?:Initial\s+)?LUCK:\s*(\d+)/i);
if (luckMatch) luck = parseInt(luckMatch[1]);

console.log("\n=== METADATA ===");
console.log("Title:", title);
console.log("Author:", author);
console.log("Description:", description);
console.log("Stats: SKILL", skill, "STAMINA", stamina, "LUCK", luck);

// Parse sections
const sections = [];
// FIXED: Added ^ before Section pattern to only match at start of line
const sectionRegex = /(?:^(?:Section|SECTION)\s*(\d+)\s*(?:\]|:|\.|–|—)|\[(\d+)\]|\((\d+)\)|^(\d+)[\.:]\s|\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim;
const matches = [];
let match;

while ((match = sectionRegex.exec(text)) !== null) {
    const sectionId = parseInt(match[1] || match[2] || match[3] || match[4] || match[5] || match[6]);
    matches.push({
        id: sectionId,
        start: match.index,
        headerEnd: match.index + match[0].length,
        matchedText: JSON.stringify(match[0])
    });
}

console.log("\n=== SECTION MATCHES ===");
console.log("Total matches found:", matches.length);
matches.forEach(m => {
    console.log(`  Section ${m.id}: index ${m.start}, headerEnd ${m.headerEnd}, matched: ${m.matchedText}`);
});

// Extract section content
for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const endPos = next ? next.start : text.length;

    let sectionText = text.substring(current.headerEnd, endPos).trim();

    // Extract title if present
    const lines = sectionText.split('\n');
    let sectionTitle = '';
    if (lines[0] && lines[0].length < 100 && !lines[0].match(/^(If|You|Turn|Go|The)/i)) {
        sectionTitle = lines[0].trim();
        sectionText = lines.slice(1).join('\n').trim();
    }

    sections.push({
        id: current.id,
        title: sectionTitle,
        text: sectionText.substring(0, 100) + (sectionText.length > 100 ? '...' : ''),
        textLength: sectionText.length
    });
}

console.log("\n=== EXTRACTED SECTIONS ===");
console.log("Total sections:", sections.length);
sections.forEach(s => {
    console.log(`\nSection ${s.id}:`);
    console.log(`  Title: "${s.title}"`);
    console.log(`  Text length: ${s.textLength}`);
    console.log(`  Text preview: ${s.text}`);
});

// Determine starting section
let startingSection = 1;
const section1 = sections.find(s => s.id === 1);
if (section1) {
    startingSection = 1;
} else {
    const firstNonIntro = sections.find(s => s.id > 0);
    startingSection = firstNonIntro?.id || 1;
}

console.log("\n=== RESULT ===");
console.log("Starting section:", startingSection);
console.log("Total sections extracted:", sections.length);
console.log("Section IDs:", sections.map(s => s.id).join(', '));

// Check if book would be valid
const isValid = title && sections.length > 0 && startingSection;
console.log("Would pass validation:", isValid);
