const { readFileSync, readdirSync, writeFileSync } = require("node:fs");
const { execSync } = require("node:child_process");
const { resolve, join } = require("node:path");

const LANG_PATH = "./packages/shared/src/languages";
const EN_FILE_PATH = `${LANG_PATH}/en.ts`;
const SOURCE_PATH = "./packages/";

const sourceFiles = getAllFiles(SOURCE_PATH)
   .filter((f) => (f.endsWith(".ts") || f.endsWith(".tsx")) && !f.endsWith(".d.ts") && !f.includes("/languages/"))
   .map((f) => readFileSync(f, { encoding: "utf8" }))
   .join()
   .replace(/\s+/g, "");

console.log("🟡 Remove Unused English Translation");
const file = readFileSync(EN_FILE_PATH, {
   encoding: "utf8",
})
   .replace("export const EN =", "")
   .replace("};", "}");

// biome-ignore lint/security/noGlobalEval: <explanation>
let en = eval(`(${file})`);

Object.keys(en).forEach((key) => {
   if (!key.startsWith("$") && !sourceFiles.includes(`L.${key}`)) {
      console.log(`Translation not used: ${key}`);
      delete en[key];
   }
});
en = Object.fromEntries(Object.entries(en).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(EN_FILE_PATH, `export const EN = ${JSON.stringify(en)};`);

console.log("🟡 Adjust Other Translation Based On English");

function getAllFiles(dir) {
   const paths = readdirSync(dir, { withFileTypes: true });
   const files = paths.map((dirent) => {
      const res = resolve(dir, dirent.name);
      return dirent.isDirectory() ? getAllFiles(res) : res;
   });
   return files.flat();
}

const reset = process.argv.includes("--reset");

readdirSync(LANG_PATH).forEach((fileName) => {
   if (!fileName.endsWith(".ts") || fileName.startsWith("en.ts")) {
      return;
   }
   const variableName = fileName.replace(".ts", "").replace("-", "_").toUpperCase();
   const filePath = `${LANG_PATH}/${fileName}`;
   const file = readFileSync(filePath, { encoding: "utf8" })
      .replace(`export const ${variableName} =`, "")
      .replace("};", "}");
   // biome-ignore lint/security/noGlobalEval: <explanation>
   const language = eval(`(${file})`);
   const result = {};
   Object.keys(en).forEach((k) => {
      if (k.startsWith("$")) {
         result[k] = language[k];
         return;
      }
      if (reset) {
         result[k] = en[k];
      }
      if (language[k]) {
         result[k] = language[k];
      }
      result[k] = en[k];
   });
   writeFileSync(filePath, `export const ${variableName} = ${JSON.stringify(result)};`);
});

console.log("🟡 Format Translation Files");

execSync(`npx @biomejs/biome format --config-path=${LANG_PATH}/ --write ${LANG_PATH}/`, {
   encoding: "utf8",
});

console.log("🟢 Translation has successfully updated");
