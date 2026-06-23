import { readFileSync, writeFileSync } from "fs";

console.log("[Switch] Reading prisma/schema.prisma...");
let schema = readFileSync("prisma/schema.prisma", "utf8");

// Switch provider
const before = schema;
schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
if (schema === before) {
  console.log("[Switch] Provider already postgresql, skipping.");
} else {
  console.log("[Switch] Provider switched: sqlite → postgresql");
}

// Add directUrl if missing
if (!schema.includes("directUrl")) {
  // Match the url line with any amount of whitespace
  const urlRegex = /(\s*url\s+=\s+env\("DATABASE_URL"\))/;
  const match = urlRegex.exec(schema);
  if (match) {
    schema = schema.replace(
      urlRegex,
      match[1] + "\n  directUrl = env(\"DIRECT_URL\")"
    );
    console.log("[Switch] Added directUrl");
  } else {
    console.log("[Switch] WARNING: Could not find url line to add directUrl");
  }
} else {
  console.log("[Switch] directUrl already present, skipping.");
}

writeFileSync("prisma/schema.prisma", schema);
console.log("[Switch] Done. Schema preview:");
console.log(schema.split("\n").slice(0, 8).join("\n"));
