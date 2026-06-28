import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser, removeAuthCookie } from "@/lib/auth";

export async function POST() {
  try {
    const payload = await getCurrentUser();
    if (!payload) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: { isActive: false },
    });

    await removeAuthCookie();

    return NextResponse.json({
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivate account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
