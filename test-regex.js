// Test the section number regex
const testText = `Title: Test
Author: Test

0

This is section 0 intro

1

This is section 1

2

This is section 2`;

const sectionRegex = /(?:(?:Section|SECTION)\s*(\d+)\s*(?:\]|:|\.|–|—)|\[(\d+)\]|\((\d+)\)|^(\d+)[\.:]\s|\*\*(\d+)\*\*|^\s*(\d+)\s*$)/gim;

console.log("Testing regex against text:");
console.log(testText);
console.log("\nMatches found:");

let match;
while ((match = sectionRegex.exec(testText)) !== null) {
    const sectionId = parseInt(match[1] || match[2] || match[3] || match[4] || match[5] || match[6]);
    console.log(`Match: "${match[0]}" at index ${match.index}, Section ID: ${sectionId}`);
    console.log(`Capture groups: [${match[1]}, ${match[2]}, ${match[3]}, ${match[4]}, ${match[5]}, ${match[6]}]`);
}
