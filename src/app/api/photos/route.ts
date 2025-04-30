import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
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

    const body = await request.json();
    const { title, description, url, cloudinaryId, albumId } = body;

    const photo = await prisma.photo.create({
      data: {
        title,
        description,
        url,
        cloudinaryId,
        albumId,
      },
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Error creating photo:", error);
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
      return new NextResponse("Photo ID is required", { status: 400 });
    }

    const photo = await prisma.photo.findUnique({
      where: { id },
      include: { album: true },
    });

    if (!photo) {
      return new NextResponse("Photo not found", { status: 404 });
    }

    if (photo.album.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete from Cloudinary
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

    // Delete from database
    await prisma.photo.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting photo:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 