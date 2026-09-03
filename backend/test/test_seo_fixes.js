import { generateSeoSlug } from "../controllers/blogController.js";

console.log("========================================");
console.log("🧪 TESTING UNICODE & SEO SLUG GENERATOR");
console.log("========================================");

// Test 1: English Title with Stop Words & Punctuation
const enTitle = "The Power and Divine Grace of Goddess Sri jai Varahi Amman in 2026!";
const enSlug = generateSeoSlug(enTitle);
console.log(`[EN Test] Input:  "${enTitle}"`);
console.log(`[EN Test] Output: "${enSlug}"`);
if (enSlug.includes("the") || enSlug.includes("and") || enSlug.includes("!")) {
  throw new Error(`Failed EN stop words or punctuation test: ${enSlug}`);
}

// Test 2: Tamil Title
const taTitle = "ஸ்ரீ மகா வாராஹி அம்மன் வழிபாட்டு முறை மற்றும் பலன்கள்";
const taSlug = generateSeoSlug(taTitle);
console.log(`[TA Test] Input:  "${taTitle}"`);
console.log(`[TA Test] Output: "${taSlug}"`);
if (!taSlug || taSlug.length < 5 || !taSlug.includes("வாராஹி")) {
  throw new Error(`Failed Tamil Unicode slug test: ${taSlug}`);
}

// Test 3: Mixed English & Tamil with Special Characters
const mixedTitle = "Varahi Malai (வாராஹி மாலை) - 32 Mantras & Benefits <Special Edition>";
const mixedSlug = generateSeoSlug(mixedTitle);
console.log(`[Mixed Test] Input:  "${mixedTitle}"`);
console.log(`[Mixed Test] Output: "${mixedSlug}"`);
if (!mixedSlug || mixedSlug.includes("<") || mixedSlug.includes("(") || mixedSlug.includes("&")) {
  throw new Error(`Failed Mixed Unicode / Special Character test: ${mixedSlug}`);
}

// Test 4: Empty / Null / Edge Case
const nullSlug = generateSeoSlug(null);
const emptySlug = generateSeoSlug("    ");
console.log(`[Edge Test] Null:  "${nullSlug}"`);
console.log(`[Edge Test] Empty: "${emptySlug}"`);
if (!nullSlug.startsWith("varahi-vani-") || !emptySlug.startsWith("varahi-vani-")) {
  throw new Error("Failed fallback slug test");
}

console.log("\n========================================");
console.log("🎉 ALL SEO & SLUG TESTS PASSED SUCCESSFULLY!");
console.log("========================================");
