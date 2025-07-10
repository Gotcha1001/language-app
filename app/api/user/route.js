import { db } from "../../../configs/schema";
import { Users } from "../../../configs/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nativeLanguage = "en", targetLanguage = "es" } = body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(Users)
      .where(eq(Users.user_id, userId));

    if (existingUser.length > 0) {
      return Response.json({
        message: "User already exists",
        user: existingUser[0],
      });
    }

    // Create new user
    const newUser = await db
      .insert(Users)
      .values({
        user_id: userId,
        native_language: nativeLanguage,
        target_language: targetLanguage,
      })
      .returning();

    return Response.json({
      message: "User created successfully",
      user: newUser[0],
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
