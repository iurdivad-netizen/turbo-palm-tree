// Test actual section extraction with full parser logic
const fs = require('fs');

const text = fs.readFileSync('test-standalone-numbers.txt', 'utf-8');

console.log("=== TESTING FULL SECTION EXTRACTION ===\n");

// Parse sections
const sections = [];
const sectionRegex = /(?:^(?:Section|SECTION)\s*(\d+)\s*(?:\]|:|\.|–|—)|^\s*\[(\d+)\]|^\s*\((\d+)\)|^(\d+)[\.:]\s|^\s*\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim;
const matches = [];
let match;

while ((match = sectionRegex.exec(text)) !== null) {
    const sectionId = parseInt(match[1] || match[2] || match[3] || match[4] || match[5] || match[6]);
    matches.push({
        id: sectionId,
        start: match.index,
        headerEnd: match.index + match[0].length
    });
}

console.log(`Found ${matches.length} section headers\n`);

// Extract section content
for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];
    const endPos = next ? next.start : text.length;

    let sectionText = text.substring(current.headerEnd, endPos).trim();

    // Parse section title (only SHORT lines that look like titles)
    let sectionTitle = '';
    const titleLineMatch = sectionText.match(/^([^\n]+)\n/);
    if (titleLineMatch &&
        titleLineMatch[1].length < 50 &&
        titleLineMatch[1].length > 0 &&
        !titleLineMatch[1].match(/^(If you|You |Turn to|Go to|The |This |Your |A )/i)) {
        sectionTitle = titleLineMatch[1].trim();
        sectionText = sectionText.substring(titleLineMatch[0].length).trim();
    }

    const section = {
        id: current.id,
        title: sectionTitle,
        text: '',
        choices: []
    };

    // Extract choices
    const choiceRegex = /(?:turn|go|proceed|move|continue|head|return)(?:\s+(?:to|back to|forward to))?\s+(?:section\s+)?(\d+)/gi;
    const choiceMatches = [...sectionText.matchAll(choiceRegex)];

    console.log(`\n=== Section ${current.id} ===`);
    console.log(`Title: "${sectionTitle}"`);
    console.log(`Raw text length: ${sectionText.length}`);
    console.log(`Choice matches found: ${choiceMatches.length}`);

    if (choiceMatches.length > 0) {
        const seenTargets = new Set();
        choiceMatches.forEach((m, idx) => {
            const targetSection = parseInt(m[1]);
            if (!seenTargets.has(targetSection)) {
                seenTargets.add(targetSection);

                // Extract choice text - get the line containing this choice
                const lines = sectionText.split('\n');
                let choiceText = '';

                // Find which line contains this match
                let charCount = 0;
                for (const line of lines) {
                    if (charCount <= m.index && m.index < charCount + line.length) {
                        choiceText = line.trim();
                        break;
                    }
                    charCount += line.length + 1; // +1 for newline
                }

                // Clean up: remove "If you" prefix, trailing periods/commas
                choiceText = choiceText
                    .replace(/^If\s+you\s+/i, '')
                    .replace(/^To\s+/i, '')
                    .replace(/[,.]$/, '')
                    .trim();

                // If choice text is too long or empty, use a simple default
                if (!choiceText || choiceText.length > 150) {
                    choiceText = `Go to ${targetSection}`;
                }

                section.choices.push({
                    text: choiceText,
                    targetSection: targetSection
                });

                console.log(`  Choice ${section.choices.length}: "${choiceText}" -> ${targetSection}`);
            }
        });
    }

    // Extract main narrative text (remove combat info and choice markers)
    let narrativeText = sectionText
        .replace(/(?:SKILL|Skill)\s+\d+(?:,|\s+)(?:STAMINA|Stamina)\s+\d+/gi, '')
        .replace(/(?:turn|go|proceed|move|continue|head|return)(?:\s+(?:to|back to|forward to))?\s+(?:section\s+)?\d+/gi, '')
        .trim();

    section.text = narrativeText;
    console.log(`Final text length: ${narrativeText.length}`);
    console.log(`Text preview: ${narrativeText.substring(0, 150)}${narrativeText.length > 150 ? '...' : ''}`);
    console.log(`Choices count: ${section.choices.length}`);

    sections.push(section);
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total sections extracted: ${sections.length}`);
console.log(`Sections with choices: ${sections.filter(s => s.choices.length > 0).length}`);
console.log(`Sections with no choices: ${sections.filter(s => s.choices.length === 0).length}`);
