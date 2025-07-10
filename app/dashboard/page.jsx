// import { db } from "../../configs/db";
// import { Languages, Levels, Lessons, UserProgress, Users } from "../../configs/schema";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { eq, inArray } from "drizzle-orm";
// import LessonCard from "../components/LessonCard";

// export default async function Dashboard() {
//     const { userId } = await auth();

//     console.log("Dashboard - User ID:", userId);

//     if (!userId) {
//         return redirect("/sign-in");
//     }

//     // Fetch user's native and target languages
//     const userData = await db.select().from(Users).where(eq(Users.user_id, userId));
//     const nativeLanguage = userData.length > 0 ? userData[0].native_language : "en";
//     const targetLanguage = userData.length > 0 ? userData[0].target_language : "ko";

//     // Fetch languages based on target language
//     const languages = await db.select().from(Languages).where(eq(Languages.code, targetLanguage));

//     // Fetch levels for the target language
//     const levels = await db
//         .select({
//             id: Levels.id,
//             language_id: Levels.language_id,
//             level_name: Levels.level_name,
//             level_order: Levels.level_order,
//         })
//         .from(Levels)
//         .innerJoin(Languages, eq(Levels.language_id, Languages.id))
//         .where(eq(Languages.code, targetLanguage));

//     // Fetch lessons for the target language's levels using inArray
//     const levelIds = levels.map(level => level.id);
//     const lessons = await db
//         .select()
//         .from(Lessons)
//         .where(inArray(Lessons.level_id, levelIds));

//     const progress = await db.select().from(UserProgress).where(eq(UserProgress.user_id, userId));

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-10">
//             <div className="flex justify-between items-center mb-8">
//                 <h1 className="text-4xl font-bold">Language Learning Dashboard</h1>
//                 <a href="/settings" className="text-lg underline hover:text-gray-200">
//                     Settings
//                 </a>
//             </div>
//             {languages.map((lang) => (
//                 <div key={lang.id} className="mb-8">
//                     <h2 className="text-2xl font-semibold mb-4">{lang.name}</h2>
//                     {levels
//                         .filter((level) => level.language_id === lang.id)
//                         .map((level) => (
//                             <div key={level.id} className="mb-6">
//                                 <h3 className="text-xl font-medium mb-4">{level.level_name}</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {lessons
//                                         .filter((lesson) => lesson.level_id === level.id)
//                                         .map((lesson) => (
//                                             <div key={lesson.id} className="relative">
//                                                 <LessonCard
//                                                     lesson={lesson}
//                                                     languageCode={lang.code}
//                                                     nativeLanguage={nativeLanguage}
//                                                     targetLanguage={targetLanguage}
//                                                 />
//                                                 {progress.some((p) => p.lesson_id === lesson.id && p.completed) && (
//                                                     <span className="absolute top-2 right-2 text-green-400">✅ Completed</span>
//                                                 )}
//                                             </div>
//                                         ))}
//                                 </div>
//                             </div>
//                         ))}
//                 </div>
//             ))}
//         </div>
//     );
// }


// import { db } from "../../configs/db";
// import { Languages, Levels, Lessons, UserProgress, Users } from "../../configs/schema";
// import { auth } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { eq, inArray } from "drizzle-orm";
// import LessonCard from "../components/LessonCard";

// export default async function Dashboard() {
//     const { userId } = await auth();
//     console.log("Dashboard - User ID:", userId);

//     if (!userId) {
//         return redirect("/sign-in");
//     }

//     // Fetch user's native and target languages
//     const userData = await db.select().from(Users).where(eq(Users.user_id, userId));
//     const nativeLanguage = userData.length > 0 ? userData[0].native_language : "en";
//     const targetLanguage = userData.length > 0 ? userData[0].target_language : "ko";

//     // Fetch languages based on target language
//     const languages = await db.select().from(Languages).where(eq(Languages.code, targetLanguage));

//     // Fetch levels for the target language
//     const levels = await db
//         .select({
//             id: Levels.id,
//             language_id: Levels.language_id,
//             level_name: Levels.level_name,
//             level_order: Levels.level_order,
//         })
//         .from(Levels)
//         .innerJoin(Languages, eq(Levels.language_id, Languages.id))
//         .where(eq(Languages.code, targetLanguage));

//     // Fetch lessons for the target language's levels using inArray
//     const levelIds = levels.map(level => level.id);
//     const lessons = await db
//         .select()
//         .from(Lessons)
//         .where(inArray(Lessons.level_id, levelIds));

//     // Check if user has any progress
//     let progress = [];
//     if (userData.length > 0) {
//         progress = await db.select().from(UserProgress).where(eq(UserProgress.user_id, userId));
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-10">
//             <div className="flex justify-between items-center mb-8">
//                 <h1 className="text-4xl font-bold">Language Learning Dashboard</h1>
//                 <a href="/settings" className="text-lg underline hover:text-gray-200">
//                     Settings
//                 </a>
//             </div>

//             {languages.map((lang) => (
//                 <div key={lang.id} className="mb-8">
//                     <h2 className="text-2xl font-semibold mb-4">{lang.name}</h2>
//                     {levels
//                         .filter((level) => level.language_id === lang.id)
//                         .map((level) => (
//                             <div key={level.id} className="mb-6">
//                                 <h3 className="text-xl font-medium mb-4">{level.level_name}</h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {lessons
//                                         .filter((lesson) => lesson.level_id === level.id)
//                                         .map((lesson) => (
//                                             <div key={lesson.id} className="relative">
//                                                 <LessonCard
//                                                     lesson={lesson}
//                                                     languageCode={lang.code}
//                                                     nativeLanguage={nativeLanguage}
//                                                     targetLanguage={targetLanguage}
//                                                 />
//                                                 {progress.some((p) => p.lesson_id === lesson.id && p.completed) && (
//                                                     <span className="absolute top-2 right-2 text-green-400">✅ Completed</span>
//                                                 )}
//                                             </div>
//                                         ))}
//                                 </div>
//                             </div>
//                         ))}
//                 </div>
//             ))}
//         </div>
//     );
// }


import { db } from "../../configs/db";
import { Languages, Levels, Lessons, UserProgress, Users } from "../../configs/schema";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq, inArray } from "drizzle-orm";
import LessonCard from "../components/LessonCard";

export default async function Dashboard() {
    const { userId } = await auth();
    console.log("Dashboard - User ID:", userId);

    if (!userId) {
        return redirect("/sign-in");
    }

    // Fetch user's native and target languages
    const userData = await db.select().from(Users).where(eq(Users.user_id, userId));

    // If user record doesn't exist, redirect to home page to allow user creation
    if (userData.length === 0) {
        console.log("Dashboard - User not found in database, redirecting to home");
        return redirect("/?message=User+creation+in+progress");
    }

    const nativeLanguage = userData[0].native_language || "en";
    const targetLanguage = userData[0].target_language || "es"; // Align with /api/user defaults

    // Fetch languages based on target language
    const languages = await db.select().from(Languages).where(eq(Languages.code, targetLanguage));

    // Fetch levels for the target language
    const levels = await db
        .select({
            id: Levels.id,
            language_id: Levels.language_id,
            level_name: Levels.level_name,
            level_order: Levels.level_order,
        })
        .from(Levels)
        .innerJoin(Languages, eq(Levels.language_id, Languages.id))
        .where(eq(Languages.code, targetLanguage));

    // Fetch lessons for the target language's levels using inArray
    const levelIds = levels.map((level) => level.id);
    const lessons = await db
        .select()
        .from(Lessons)
        .where(inArray(Lessons.level_id, levelIds));

    // Fetch user progress
    let progress = [];
    try {
        progress = await db.select().from(UserProgress).where(eq(UserProgress.user_id, userId));
    } catch (error) {
        console.error("Error fetching user progress:", error);
        // Optionally handle error (e.g., show error message or use empty progress)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Language Learning Dashboard</h1>
                <a href="/settings" className="text-lg underline hover:text-gray-200">
                    Settings
                </a>
            </div>

            {languages.map((lang) => (
                <div key={lang.id} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{lang.name}</h2>
                    {levels
                        .filter((level) => level.language_id === lang.id)
                        .map((level) => (
                            <div key={level.id} className="mb-6">
                                <h3 className="text-xl font-medium mb-4">{level.level_name}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {lessons
                                        .filter((lesson) => lesson.level_id === level.id)
                                        .map((lesson) => (
                                            <div key={lesson.id} className="relative">
                                                <LessonCard
                                                    lesson={lesson}
                                                    languageCode={lang.code}
                                                    nativeLanguage={nativeLanguage}
                                                    targetLanguage={targetLanguage}
                                                />
                                                {progress.some((p) => p.lesson_id === lesson.id && p.completed) && (
                                                    <span className="absolute top-2 right-2 text-green-400">✅ Completed</span>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                </div>
            ))}
        </div>
    );
}