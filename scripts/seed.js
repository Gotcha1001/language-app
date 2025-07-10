// import "dotenv/config";
// import { neon } from "@neondatabase/serverless";
// import { drizzle } from "drizzle-orm/neon-http";
// import { Languages, Levels, Lessons, Users, Words } from "../configs/schema.js";
// import fs from "fs/promises";
// import path from "path";

// const sql = neon(process.env.DRIZZLE_DATABASE_URL);
// const db = drizzle(sql, {
//   schema: { Languages, Levels, Lessons, Users, Words },
// });

// async function seedDatabase() {
//   try {
//     console.log("Seeding database...");

//     // Seed Users
//     console.log("Seeding users...");
//     const existingUsers = await db.select().from(Users);
//     if (existingUsers.length === 0) {
//       await db.insert(Users).values([
//         {
//           user_id: "user_2zVhwdLjaq05Vyjrz3UmNiXNq2H",
//           native_language: "en",
//           target_language: "ko",
//         },
//         {
//           user_id: "user_3aBcDeFgHiJkLmNoPqRsTuVwXyZ",
//           native_language: "ko",
//           target_language: "en",
//         },
//       ]);
//       console.log("Inserted example users");
//     }

//     // Dynamically import language data
//     const dataDir = path.join(process.cwd(), "data");
//     const files = await fs.readdir(dataDir);
//     const languageFiles = files.filter((file) => file.endsWith(".js"));

//     const languageMap = {};
//     const levelMap = {};
//     const lessonMap = {};

//     for (const file of languageFiles) {
//       const { languageData } = await import(`../data/${file}`);

//       // Seed Languages
//       console.log(`Seeding language: ${languageData.name}`);
//       const existingLanguages = await db.select().from(Languages);
//       if (!existingLanguages.some((lang) => lang.code === languageData.code)) {
//         const [language] = await db
//           .insert(Languages)
//           .values({ name: languageData.name, code: languageData.code })
//           .returning({ id: Languages.id, name: Languages.name });
//         languageMap[languageData.name] = language.id;
//       } else {
//         const existing = existingLanguages.find(
//           (lang) => lang.code === languageData.code
//         );
//         languageMap[languageData.name] = existing.id;
//       }

//       // Seed Levels
//       for (const level of languageData.levels) {
//         console.log(
//           `Seeding level: ${level.level_name} for ${languageData.name}`
//         );
//         const existingLevels = await db.select().from(Levels);
//         if (
//           !existingLevels.some(
//             (l) =>
//               l.language_id === languageMap[languageData.name] &&
//               l.level_name === level.level_name
//           )
//         ) {
//           const [insertedLevel] = await db
//             .insert(Levels)
//             .values({
//               language_id: languageMap[languageData.name],
//               level_name: level.level_name,
//               level_order: level.level_order,
//             })
//             .returning({ id: Levels.id, level_name: Levels.level_name });
//           levelMap[`${languageData.name}-${level.level_name}`] =
//             insertedLevel.id;
//         } else {
//           const existing = existingLevels.find(
//             (l) =>
//               l.language_id === languageMap[languageData.name] &&
//               l.level_name === level.level_name
//           );
//           levelMap[`${languageData.name}-${level.level_name}`] = existing.id;
//         }

//         // Seed Lessons
//         for (const lesson of level.lessons) {
//           console.log(
//             `Seeding lesson: ${lesson.lesson_name} for ${level.level_name}`
//           );
//           const existingLessons = await db.select().from(Lessons);
//           if (
//             !existingLessons.some(
//               (l) =>
//                 l.level_id ===
//                   levelMap[`${languageData.name}-${level.level_name}`] &&
//                 l.lesson_name === lesson.lesson_name
//             )
//           ) {
//             const [insertedLesson] = await db
//               .insert(Lessons)
//               .values({
//                 level_id: levelMap[`${languageData.name}-${level.level_name}`],
//                 lesson_name: lesson.lesson_name,
//                 context: lesson.context,
//               })
//               .returning({ id: Lessons.id, lesson_name: Lessons.lesson_name });
//             lessonMap[
//               `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
//             ] = insertedLesson.id;
//           } else {
//             const existing = existingLessons.find(
//               (l) =>
//                 l.level_id ===
//                   levelMap[`${languageData.name}-${level.level_name}`] &&
//                 l.lesson_name === lesson.lesson_name
//             );
//             lessonMap[
//               `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
//             ] = existing.id;
//           }

//           // Seed Words
//           console.log(`Seeding words for lesson: ${lesson.lesson_name}`);
//           const existingWords = await db.select().from(Words);
//           const wordsToInsert = lesson.words
//             .filter(
//               (word) =>
//                 !existingWords.some(
//                   (w) =>
//                     w.lesson_id ===
//                       lessonMap[
//                         `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
//                       ] && w.word === word.word
//                 )
//             )
//             .map((word) => ({
//               ...word,
//               lesson_id:
//                 lessonMap[
//                   `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
//                 ],
//             }));

//           if (wordsToInsert.length > 0) {
//             await db.insert(Words).values(wordsToInsert);
//             console.log(
//               `Inserted ${wordsToInsert.length} words for ${lesson.lesson_name}`
//             );
//           } else {
//             console.log(
//               `No new words to insert for ${lesson.lesson_name} (already exists or empty)`
//             );
//           }
//         }
//       }
//     }

//     console.log("Database seeded successfully!");
//   } catch (error) {
//     console.error("Error seeding database:", error);
//     throw error;
//   }
// }

// seedDatabase().then(() => process.exit(0));

// Seed.js
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Languages, Levels, Lessons, Users, Words } from "../configs/schema.js";
import fs from "fs/promises";
import path from "path";

const sql = neon(process.env.DRIZZLE_DATABASE_URL);
const db = drizzle(sql, {
  schema: { Languages, Levels, Lessons, Users, Words },
});

async function seedDatabase() {
  try {
    console.log("Seeding database...");
    console.log("Reading data directory:", path.join(process.cwd(), "data"));

    // Dynamically import language data
    const dataDir = path.join(process.cwd(), "data");
    const files = await fs.readdir(dataDir);
    const languageFiles = files.filter((file) => file.endsWith(".js"));
    console.log("Found language files:", languageFiles);

    if (!languageFiles.includes("Spanish.js")) {
      console.error("Spanish.js not found in data directory!");
    }

    const languageMap = {};
    const levelMap = {};
    const lessonMap = {};

    for (const file of languageFiles) {
      console.log(`Processing file: ${file}`);
      const filePath = path.join(dataDir, file);
      try {
        const { languageData } = await import(`file://${filePath}`);
        console.log(
          `Loaded language data: ${languageData.name} (${languageData.code})`
        );

        // Seed Languages
        console.log(`Seeding language: ${languageData.name}`);
        const existingLanguages = await db.select().from(Languages);
        console.log("Existing languages in DB:", existingLanguages);

        if (
          !existingLanguages.some((lang) => lang.code === languageData.code)
        ) {
          const [language] = await db
            .insert(Languages)
            .values({ name: languageData.name, code: languageData.code })
            .returning({
              id: Languages.id,
              name: Languages.name,
              code: Languages.code,
            });
          languageMap[languageData.name] = language.id;
          console.log(
            `Inserted language: ${language.name} (ID: ${language.id}, Code: ${language.code})`
          );
        } else {
          const existing = existingLanguages.find(
            (lang) => lang.code === languageData.code
          );
          languageMap[languageData.name] = existing.id;
          console.log(
            `Language already exists: ${languageData.name} (ID: ${existing.id}, Code: ${existing.code})`
          );
        }

        // Seed Levels
        for (const level of languageData.levels) {
          console.log(
            `Seeding level: ${level.level_name} for ${languageData.name}`
          );
          const existingLevels = await db.select().from(Levels);
          if (
            !existingLevels.some(
              (l) =>
                l.language_id === languageMap[languageData.name] &&
                l.level_name === level.level_name
            )
          ) {
            const [insertedLevel] = await db
              .insert(Levels)
              .values({
                language_id: languageMap[languageData.name],
                level_name: level.level_name,
                level_order: level.level_order,
              })
              .returning({ id: Levels.id, level_name: Levels.level_name });
            levelMap[`${languageData.name}-${level.level_name}`] =
              insertedLevel.id;
          } else {
            const existing = existingLevels.find(
              (l) =>
                l.language_id === languageMap[languageData.name] &&
                l.level_name === level.level_name
            );
            levelMap[`${languageData.name}-${level.level_name}`] = existing.id;
          }

          // Seed Lessons
          for (const lesson of level.lessons) {
            console.log(
              `Seeding lesson: ${lesson.lesson_name} for ${level.level_name}`
            );
            const existingLessons = await db.select().from(Lessons);
            if (
              !existingLessons.some(
                (l) =>
                  l.level_id ===
                    levelMap[`${languageData.name}-${level.level_name}`] &&
                  l.lesson_name === lesson.lesson_name
              )
            ) {
              const [insertedLesson] = await db
                .insert(Lessons)
                .values({
                  level_id:
                    levelMap[`${languageData.name}-${level.level_name}`],
                  lesson_name: lesson.lesson_name,
                  context: lesson.context,
                })
                .returning({
                  id: Lessons.id,
                  lesson_name: Lessons.lesson_name,
                });
              lessonMap[
                `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
              ] = insertedLesson.id;
            } else {
              const existing = existingLessons.find(
                (l) =>
                  l.level_id ===
                    levelMap[`${languageData.name}-${level.level_name}`] &&
                  l.lesson_name === lesson.lesson_name
              );
              lessonMap[
                `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
              ] = existing.id;
            }

            // Seed Words
            console.log(`Seeding words for lesson: ${lesson.lesson_name}`);
            const existingWords = await db.select().from(Words);
            const wordsToInsert = lesson.words
              .filter(
                (word) =>
                  !existingWords.some(
                    (w) =>
                      w.lesson_id ===
                        lessonMap[
                          `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
                        ] && w.word === word.word
                  )
              )
              .map((word) => ({
                ...word,
                lesson_id:
                  lessonMap[
                    `${languageData.name}-${level.level_name}-${lesson.lesson_name}`
                  ],
              }));

            if (wordsToInsert.length > 0) {
              await db.insert(Words).values(wordsToInsert);
              console.log(
                `Inserted ${wordsToInsert.length} words for ${lesson.lesson_name}`
              );
            } else {
              console.log(`No new words to insert for ${lesson.lesson_name}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
      }
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seedDatabase().then(() => process.exit(0));
