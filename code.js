import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// __dirname ni olish uchun
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * src papkasidagi fayllarni rekursiv o'qish
 */
function readAllFiles() {
  const result = [];

  // React/JS fayl turlarini belgilaymiz
  const allowedExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".css",
    ".scss",
    ".html",
    ".json",
  ];

  /**
   * Papkani rekursiv o'qish
   * @param {string} dirPath - Papka yo'li
   */
  function readDir(dirPath) {
    const files = readdirSync(dirPath);

    for (const file of files) {
      const fullPath = join(dirPath, file);
      const relativePath = fullPath.replace(/\\/g, "/"); // Yo'l separatorlarini normallashtirish

      // Papka statusini tekshirish
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // node_modules va .git papkalarini o'tkazib yuborish
        if (file !== "node_modules" && file !== ".git") {
          readDir(fullPath);
        }
      } else {
        // Faqat belgilangan kengaytmali fayllarni o'qish
        const ext = extname(file);
        if (allowedExtensions.includes(ext)) {
          try {
            // Fayl contentini o'qish
            const content = readFileSync(fullPath, "utf-8");

            // Fayl turi bo'yicha syntax highlight uchun
            let fileExt = ext.slice(1); // .js -> js
            if (fileExt === "jsx" || fileExt === "tsx") {
              fileExt = "javascript";
            } else if (fileExt === "scss") {
              fileExt = "css";
            }

            // Chiqarishni formatlash
            const fileBlock = `\`${relativePath}\`\n\`\`\`${fileExt}\n${content}\n\`\`\`\n`;
            result.push(fileBlock + "- - - - -\n");
          } catch (err) {
            console.error(
              `Faylni o'qishda xatolik ${fullPath}: ${err.message}`
            );
          }
        }
      }
    }
  }

  // src papkasidan boshlash
  try {
    readDir("src");
  } catch (err) {
    console.error("src papkasini o'qishda xatolik:", err.message);
  }

  return result;
}

/**
 * Formatlangan fayl bloklarini chiqish fayliga saqlash
 * @param {string[]} fileBlocks - Fayl bloklari
 * @param {string} outputFile - Chiqish fayli nomi
 */
function saveToFile(fileBlocks, outputFile = "frontend_code.txt") {
  try {
    const timestamp = new Date().toLocaleString();
    const output = [
      "# Frontend Project Code Export",
      `Export date: ${timestamp}\n`,
      ...fileBlocks,
    ].join("\n");

    writeFileSync(outputFile, output, "utf-8");
    console.log(`Ma'lumotlar muvaffaqiyatli yozildi: ${outputFile}`);
  } catch (err) {
    console.error(`Faylga yozishda xatolik: ${err.message}`);
  }
}

function main() {
  const fileBlocks = readAllFiles();
  saveToFile(fileBlocks);
  console.log(`Tugallandi: ${new Date().toLocaleString()}`);
}

main();
