import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  try {
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    return NextResponse.json({
      device: {
        id: device.id,
        paperColor: device.paperColor,
        createdAt: device.createdAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch device" },
      { status: 500 }
    );
  }
}
