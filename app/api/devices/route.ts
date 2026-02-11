import { NextResponse } from "next/server";
import { z } from "zod";

import { isPaperColor, PAPER_COLORS } from "@/lib/device";
import { prisma } from "@/lib/prisma";

const createDeviceSchema = z.object({
  id: z.string().uuid(),
  paperColor: z.enum(PAPER_COLORS),
});

export async function POST(request: Request) {
  try {
    const payload = createDeviceSchema.parse(await request.json());

    if (!isPaperColor(payload.paperColor)) {
      return NextResponse.json({ error: "Invalid paper color" }, { status: 400 });
    }

    const device = await prisma.device.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        paperColor: payload.paperColor,
      },
      update: {
        paperColor: payload.paperColor,
      },
    });

    return NextResponse.json({
      device: {
        id: device.id,
        paperColor: device.paperColor,
        createdAt: device.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid device payload", details: error.issues },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "";

    if (message.includes("DATABASE_URL")) {
      return NextResponse.json(
        {
          error:
            "Database is not configured. Set DATABASE_URL in .env or .env.local, then run `npx prisma db push`.",
        },
        { status: 500 }
      );
    }

    if (
      message.includes("Can't reach database server") ||
      message.includes("Connection refused")
    ) {
      return NextResponse.json(
        {
          error:
            "Database is not reachable. Start PostgreSQL and verify DATABASE_URL.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create device" },
      { status: 500 }
    );
  }
}
