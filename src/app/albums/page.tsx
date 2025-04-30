import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

type AlbumWithFirstPhoto = {
  id: string;
  title: string;
  description: string | null;
  photos: {
    url: string;
    title: string;
  }[];
};

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      photos: {
        take: 1,
        select: {
          url: true,
          title: true,
        },
      },
    },
  }) as AlbumWithFirstPhoto[];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Albums</h1>
        <p className="text-gray-600 mt-2">Browse all photo albums</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/albums/${album.id}`}
            className="block group"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg">
              {album.photos[0] ? (
                <Image
                  src={album.photos[0].url}
                  alt={album.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No photos yet</span>
                </div>
              )}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{album.title}</h3>
            {album.description && (
              <p className="text-gray-600">{album.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
} 