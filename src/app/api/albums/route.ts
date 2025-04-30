import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;

    const body = await request.json();
    const { title, description } = body;

    const album = await prisma.album.create({
      data: {
        title,
        description,
        userId: user.id,
      },
    });

    return NextResponse.json(album);
  } catch (error) {
    console.error("Error creating album:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = session.user as SessionUser;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Album ID is required", { status: 400 });
    }

    const album = await prisma.album.findUnique({
      where: { id },
    });

    if (!album) {
      return new NextResponse("Album not found", { status: 404 });
    }

    if (album.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all photos in the album from Cloudinary
    const photos = await prisma.photo.findMany({
      where: { albumId: id },
    });

    for (const photo of photos) {
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: photo.cloudinaryId,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            timestamp: Math.floor(Date.now() / 1000),
          }),
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Failed to delete from Cloudinary");
      }
    }

    // Delete the album and all its photos from the database
    await prisma.album.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting album:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 