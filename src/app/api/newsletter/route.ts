import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/utils";

const subscribeSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? "Invalid email." },
      { status: 422 }
    );
  }

  const { email } = parsed.data;

  try {
    const existing = await prisma.newsletter.findUnique({ where: { email } });

    if (existing) {
      if (existing.isSubscribed) {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed to ride updates.",
        });
      }

      await prisma.newsletter.update({
        where: { email },
        data: { isSubscribed: true, subscribedAt: new Date(), unsubscribedAt: null },
      });

      return NextResponse.json({ success: true, message: "Welcome back! You're subscribed again." });
    }

    await prisma.newsletter.create({
      data: {
        email,
        unsubscribeToken: generateToken(24),
      },
    });

    return NextResponse.json({ success: true, message: "You're on the list. Ride updates incoming." });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
