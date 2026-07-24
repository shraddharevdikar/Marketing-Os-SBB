const fs = require('fs');

async function main() {
  console.log("Fetching JS bundle...");
  const res = await fetch("https://sovereign-business-brain-marketingos-1029158855593.asia-southeast1.run.app/assets/index-B9gpRy08.js");
  const text = await res.text();
  console.log("JS bundle fetched. Size:", text.length);

  const target = "Full enterprise oversight. Can approve any budget";
  const index = text.indexOf(target);
  if (index === -1) {
    console.log("Target string not found!");
    return;
  }
  console.log("Target found at index:", index);

  const start = Math.max(0, index - 120000);
  const end = text.length; // From start to the VERY END of the file!
  const chunk = text.substring(start, end);
  
  fs.writeFileSync("extracted_chunk.js", chunk);
  console.log("Extracted chunk of size", chunk.length, "written to extracted_chunk.js");
}

main().catch(console.error);
