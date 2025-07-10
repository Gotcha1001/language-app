import { NextResponse } from "next/server";
import { db } from "../../../configs/db";
import { Words, Lessons } from "../../../configs/schema";
import { eq } from "drizzle-orm";
import { sentenceMappings } from "../../../data/sentenceMappings";

export async function POST(request) {
  try {
    const {
      lessonId,
      languageCode,
      context,
      nativeLanguage = "en",
    } = await request.json();
    console.log("Received request:", {
      lessonId,
      languageCode,
      context,
      nativeLanguage,
    });

    if (!lessonId || !languageCode || !context || !nativeLanguage) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify lesson exists
    const lesson = await db
      .select()
      .from(Lessons)
      .where(eq(Lessons.id, lessonId));
    console.log("Fetched lesson:", lesson);

    if (lesson.length === 0) {
      return NextResponse.json(
        { error: `Lesson with ID ${lessonId} not found` },
        { status: 404 }
      );
    }

    // Fetch words from the database
    const words = await db
      .select({
        word: Words.word,
        translation: Words.translation,
        pronunciation: Words.pronunciation,
      })
      .from(Words)
      .where(eq(Words.lesson_id, lessonId));

    console.log("Fetched words:", words);

    if (words.length === 0) {
      return NextResponse.json(
        { error: `No words found for lesson ID ${lessonId}` },
        { status: 404 }
      );
    }

    // Map language codes to speech synthesis language codes
    const languageSpeechMap = {
      en: "en-US",
      ko: "ko-KR",
      de: "de-DE",
      es: "es-ES",
      fr: "fr-FR",
      it: "it-IT", // Added Italian
      ja: "ja-JP", // Added Japanese
    };

    // Generate translation quiz
    const translationQuiz = words
      .slice(0, Math.min(3, words.length))
      .map((word) => {
        const options = generateOptions(
          nativeLanguage === languageCode ? word.translation : word.word,
          words,
          nativeLanguage === languageCode
        );
        return {
          question: `What does '${
            nativeLanguage === languageCode ? word.word : word.translation
          }' mean?`,
          options,
          correctAnswer:
            nativeLanguage === languageCode ? word.translation : word.word,
        };
      });

    // Generate fill-in-the-blank quiz with sentence-to-word mapping
    const fillInTheBlankQuiz = generateFillInTheBlankQuiz(
      words,
      context,
      nativeLanguage,
      languageCode
    );

    const content = {
      words,
      translationQuiz,
      fillInTheBlankQuiz,
      speechLang: languageSpeechMap[languageCode] || "en-US",
    };

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error fetching lesson content:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson content" },
      { status: 500 }
    );
  }
}

// Helper function to generate fill-in-the-blank quiz
function generateFillInTheBlankQuiz(
  words,
  context,
  nativeLanguage,
  languageCode
) {
  // Use imported sentenceMappings
  const mappings = sentenceMappings[languageCode]?.[context] || [
    {
      sentence: `I need a _____ for ${context}.`,
      word: words[0]?.word || "unknown",
      translation: words[0]?.translation || "unknown",
    },
  ];

  // Filter mappings to ensure words exist in the provided words array
  const validMappings = mappings.filter(({ word }) =>
    words.some((w) => w.word === word)
  );

  if (!validMappings.length) {
    console.warn(
      `No valid mappings found for languageCode: ${languageCode}, context: ${context}`
    );
    return [];
  }

  // Shuffle mappings and take up to 3
  const shuffledMappings = validMappings
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(3, validMappings.length));

  return shuffledMappings.map(({ sentence, word, translation }) => {
    const options = generateOptions(
      nativeLanguage === languageCode ? translation : word,
      words,
      nativeLanguage === languageCode
    );
    return {
      question: sentence,
      options,
      correctAnswer: nativeLanguage === languageCode ? translation : word,
    };
  });
}

// Helper function to generate multiple-choice options
function generateOptions(correctTranslation, words, isTranslationQuiz) {
  const field = isTranslationQuiz ? "translation" : "word";
  const correctWord = words.find(
    (w) => (isTranslationQuiz ? w.translation : w.word) === correctTranslation
  );

  if (!correctWord) {
    console.warn(
      `generateOptions - No correct word found for: ${correctTranslation}, returning default options`
    );
    return [correctTranslation, "Option 1", "Option 2", "Option 3"];
  }

  const correctAnswer = correctWord[field];
  // Include all words' translations (or words) as options
  const options = words
    .filter((w) => w && w[field] !== undefined)
    .map((w) => w[field]);

  // Ensure correct answer is included (should already be in options)
  if (!options.includes(correctAnswer)) {
    console.warn(
      `Correct answer was not in options, adding it: ${correctAnswer}`
    );
    options.push(correctAnswer);
  }

  // Shuffle options randomly
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  return options.slice(0, 5); // Limit to 4 options for consistency
}
