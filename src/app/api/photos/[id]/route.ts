import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: params.id },
      include: {
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!photo) {
      return new NextResponse("Photo not found", { status: 404 });
    }

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error fetching photo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 