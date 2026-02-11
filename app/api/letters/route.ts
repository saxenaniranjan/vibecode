import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { PAPER_COLORS } from "@/lib/device";
import { serializeLetter } from "@/lib/letters";
import { prisma } from "@/lib/prisma";

const createLetterSchema = z.object({
  authorDeviceId: z.string().uuid(),
  content: z.string().max(50000),
  isBookmarked: z.boolean().optional(),
  isFinished: z.boolean().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  q: z.string().optional(),
  year: z.coerce.number().int().min(1970).max(2100).optional(),
  bookmarked: z.enum(["true", "false"]).optional(),
  withImages: z.enum(["true", "false"]).optional(),
  paperColor: z.enum(PAPER_COLORS).optional(),
  authorDeviceId: z.string().uuid().optional(),
});

function resolveWhere(input: z.infer<typeof listQuerySchema>): Prisma.LetterWhereInput {
  const where: Prisma.LetterWhereInput = {};

  if (input.authorDeviceId) {
    where.authorDeviceId = input.authorDeviceId;
  }

  if (input.q && input.q.trim()) {
    where.content = {
      contains: input.q.trim(),
      mode: "insensitive",
    };
  }

  if (input.year) {
    where.createdAt = {
      gte: new Date(`${input.year}-01-01T00:00:00.000Z`),
      lt: new Date(`${input.year + 1}-01-01T00:00:00.000Z`),
    };
  }

  if (input.bookmarked) {
    where.isBookmarked = input.bookmarked === "true";
  }

  if (input.withImages) {
    where.images = input.withImages === "true" ? { some: {} } : { none: {} };
  }

  if (input.paperColor) {
    where.author = {
      paperColor: input.paperColor,
    };
  }

  return where;
}

export async function GET(request: Request) {
  try {
    const searchParams = Object.fromEntries(new URL(request.url).searchParams.entries());
    const query = listQuerySchema.parse(searchParams);

    const where = resolveWhere(query);
    const offset = (query.page - 1) * query.pageSize;

    const [total, letters, yearRows] = await prisma.$transaction([
      prisma.letter.count({ where }),
      prisma.letter.findMany({
        where,
        include: {
          author: true,
          images: {
            orderBy: { uploadedAt: "desc" },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: query.pageSize,
      }),
      prisma.letter.findMany({
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const years = Array.from(
      new Set(yearRows.map((row) => row.createdAt.getUTCFullYear()))
    ).sort((a, b) => b - a);

    return NextResponse.json({
      items: letters.map(serializeLetter),
      total,
      page: query.page,
      pageSize: query.pageSize,
      hasMore: offset + query.pageSize < total,
      years,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch letters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = createLetterSchema.parse(await request.json());

    const device = await prisma.device.findUnique({
      where: { id: payload.authorDeviceId },
      select: { id: true },
    });

    if (!device) {
      return NextResponse.json({ error: "Unknown device" }, { status: 404 });
    }

    const letter = await prisma.letter.create({
      data: {
        authorDeviceId: payload.authorDeviceId,
        content: payload.content,
        isBookmarked: payload.isBookmarked ?? false,
        isFinished: payload.isFinished ?? false,
      },
      include: {
        author: true,
        images: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    return NextResponse.json({ letter: serializeLetter(letter) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid letter payload", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create letter" },
      { status: 500 }
    );
  }
}
