// Test all 6 formats to ensure the fix doesn't break anything
const fs = require('fs');

const files = [
    'test-section-0.txt',
    'test-pdf-format-1.txt',
    'test-pdf-format-2.txt',
    'test-markdown-bold.txt',
    'test-standalone-numbers.txt',
    'test-mixed-formats.txt'
];

// FIXED: All patterns now require start of line to avoid false positives
// Note: Colons and other punctuation are OPTIONAL for "Section N" format
const sectionRegex = /(?:^(?:Section|SECTION)\s+(\d+)\s*(?:\]|:|\.|–|—)?|^\s*\[(\d+)\]|^\s*\((\d+)\)|^(\d+)[\.:]\s|^\s*\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim;

files.forEach(filename => {
    console.log(`\n=== Testing ${filename} ===`);

    try {
        const text = fs.readFileSync(filename, 'utf-8');
        const matches = [];
        let match;

        const regex = new RegExp(sectionRegex.source, sectionRegex.flags);
        while ((match = regex.exec(text)) !== null) {
            const sectionId = parseInt(match[1] || match[2] || match[3] || match[4] || match[5] || match[6]);
            matches.push(sectionId);
        }

        console.log(`Sections found: ${matches.join(', ')}`);
        console.log(`Total: ${matches.length} sections`);

        // Check for duplicates
        const unique = [...new Set(matches)];
        if (unique.length !== matches.length) {
            console.log(`⚠️  WARNING: Duplicate sections detected!`);
            const duplicates = matches.filter((item, index) => matches.indexOf(item) !== index);
            console.log(`   Duplicates: ${[...new Set(duplicates)].join(', ')}`);
        } else {
            console.log(`✅ No duplicates`);
        }
    } catch (e) {
        console.log(`❌ Error: ${e.message}`);
    }
});

console.log('\n=== Test Complete ===');
