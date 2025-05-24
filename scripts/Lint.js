const { globSync } = require("glob");
const { resolve } = require("node:path");
const { readFileSync } = require("node:fs");

const pattern = resolve(__dirname, "../packages/shared/src/**/*.ts").split("\\").join("/");
const files = globSync(pattern);

const result = [];

files.forEach((file) => {
   const content = readFileSync(file, "utf-8");
   if (content.includes("/client/src/")) {
      result.push(file);
   }
});

if (result.length > 0) {
   console.log("🟡 Found files in shared project with references to client project");
   result.forEach((file) => {
      console.log(file);
   });
   process.exit(1);
}
