import { NextResponse } from "next/server";
import { db } from "../../../configs/schema";
import { UserProgress } from "../../../configs/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function POST(request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId, completed } = await request.json();

    if (!lessonId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 }
      );
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
      // Insert new progress
      await db.insert(UserProgress).values({
        user_id: userId,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date() : null,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
