import { NextResponse } from "next/server";

import { serializeLetter } from "@/lib/letters";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadImageToCloud,
} from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");
    const letterId = formData.get("letterId");
    const deviceId = formData.get("deviceId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (typeof letterId !== "string" || typeof deviceId !== "string") {
      return NextResponse.json(
        { error: "letterId and deviceId are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: "Unsupported image type" },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image exceeds 8MB" }, { status: 400 });
    }

    const letter = await prisma.letter.findUnique({
      where: { id: letterId },
      select: { id: true, _count: { select: { images: true } } },
    });

    if (!letter) {
      return NextResponse.json({ error: "Letter not found" }, { status: 404 });
    }

    if (letter._count.images >= 1) {
      return NextResponse.json(
        { error: "Only one photo can be attached to a letter" },
        { status: 400 }
      );
    }

    const upload = await uploadImageToCloud({ file, deviceId });

    await prisma.image.create({
      data: {
        letterId,
        imageUrl: upload.imageUrl,
      },
    });

    const updatedLetter = await prisma.letter.findUnique({
      where: { id: letterId },
      include: {
        author: true,
        images: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!updatedLetter) {
      return NextResponse.json(
        { error: "Letter was updated but could not be returned" },
        { status: 500 }
      );
    }

    return NextResponse.json({ letter: serializeLetter(updatedLetter) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Image upload failed",
      },
      { status: 500 }
    );
  }
}
