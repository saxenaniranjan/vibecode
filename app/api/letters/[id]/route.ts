import { NextResponse } from "next/server";
import { z } from "zod";

import { serializeLetter } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

const updateLetterSchema = z
  .object({
    content: z.string().max(50000).optional(),
    isBookmarked: z.boolean().optional(),
    isFinished: z.boolean().optional(),
  })
  .refine(
    (payload) =>
      payload.content !== undefined ||
      payload.isBookmarked !== undefined ||
      payload.isFinished !== undefined,
    "At least one field is required"
  );

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const letter = await prisma.letter.findUnique({
      where: { id: context.params.id },
      include: {
        author: true,
        images: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    return NextResponse.json({ letter: serializeLetter(letter) });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch letter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const payload = updateLetterSchema.parse(await request.json());

    const existing = await prisma.letter.findUnique({
      where: { id: context.params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    const updated = await prisma.letter.update({
      where: { id: context.params.id },
      data: {
        content: payload.content,
        isBookmarked: payload.isBookmarked,
        isFinished: payload.isFinished,
      },
      include: {
        author: true,
        images: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ letter: serializeLetter(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid update payload", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update letter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
) {
  try {
    const existing = await prisma.letter.findUnique({
      where: { id: context.params.id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    await prisma.letter.delete({
      where: { id: context.params.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete letter" },
      { status: 500 }
    );
  }
}
