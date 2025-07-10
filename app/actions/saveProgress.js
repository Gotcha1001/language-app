"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../../configs/db";
import { UserProgress } from "../../configs/schema";
import { eq, and } from "drizzle-orm";

export async function saveProgress(lessonId, completed) {
  try {
    // Get the auth object - this should work with the latest Clerk version
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Check if progress already exists
    const existingProgress = await db
      .select()
      .from(UserProgress)
      .where(
        and(
          eq(UserProgress.user_id, userId),
          eq(UserProgress.lesson_id, lessonId)
        )
      );

    if (existingProgress.length > 0) {
      // Update existing progress
      await db
        .update(UserProgress)
        .set({
          completed,
          completed_at: completed ? new Date() : null,
        })
        .where(
          and(
            eq(UserProgress.user_id, userId),
            eq(UserProgress.lesson_id, lessonId)
          )
        );
    } else {
      // Create new progress record
      await db.insert(UserProgress).values({
        user_id: userId,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date() : null,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving progress:", error);

    // Return a more specific error message
    if (error.message === "Unauthorized") {
      throw new Error("Authentication failed. Please sign in again.");
    }

    throw new Error("Server error. Please try again later.");
  }
}
