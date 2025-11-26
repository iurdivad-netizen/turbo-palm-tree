// Test the real import format
const fs = require('fs');

const text = fs.readFileSync('test-real-import.txt', 'utf-8');

console.log("=== TESTING REAL IMPORT FORMAT ===\n");

// Updated regex with optional punctuation after SECTION X
const sectionRegex = /(?:^(?:Section|SECTION)\s+(\d+)\s*(?:\]|:|\.|–|—)?|^\s*\[(\d+)\]|^\s*\((\d+)\)|^(\d+)[\.:]\s|^\s*\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim;

const matches = [];
let match;

while ((match = sectionRegex.exec(text)) !== null) {
    const sectionId = parseInt(match[1] || match[2] || match[3] || match[4] || match[5] || match[6]);
    matches.push({
        id: sectionId,
        matchText: match[0],
        index: match.index
    });
}

console.log(`Found ${matches.length} sections\n`);

matches.forEach(m => {
    console.log(`Section ${m.id}: matched "${m.matchText.trim()}" at index ${m.index}`);
});

console.log('\n=== Section IDs ===');
console.log(matches.map(m => m.id).join(', '));

// Check for expected sections
const expectedSections = [1, 45, 89, 112, 127, 150, 180, 200, 234, 267, 298, 999];
const foundSections = matches.map(m => m.id).sort((a, b) => a - b);

console.log('\n=== Verification ===');
console.log('Expected sections:', expectedSections.join(', '));
console.log('Found sections:   ', foundSections.join(', '));

const missing = expectedSections.filter(s => !foundSections.includes(s));
const extra = foundSections.filter(s => !expectedSections.includes(s));

if (missing.length > 0) {
    console.log('❌ Missing sections:', missing.join(', '));
} else {
    console.log('✅ All expected sections found!');
}

if (extra.length > 0) {
    console.log('⚠️  Extra sections:', extra.join(', '));
}

// Test choice extraction
console.log('\n=== Testing Choice Extraction ===');
const choiceRegex = /(?:turn|go|proceed|move|continue|head|return)(?:\s+(?:to|back to|forward to))?\s+(?:section\s+)?(\d+)/gi;
let choiceMatch;
const choices = [];

while ((choiceMatch = choiceRegex.exec(text)) !== null) {
    choices.push(parseInt(choiceMatch[1]));
}

console.log(`Found ${choices.length} choice references`);
console.log('Choice targets:', [...new Set(choices)].sort((a, b) => a - b).join(', '));
