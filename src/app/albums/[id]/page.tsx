import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { notFound } from "next/navigation";

type Photo = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  createdAt: Date;
};

type Album = {
  id: string;
  title: string;
  description: string | null;
  photos: Photo[];
};

type Props = {
  params: { id: string };
};

export default async function AlbumPage({ params }: Props) {
  const album = await prisma.album.findUnique({
    where: { id: params.id },
    include: {
      photos: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  }) as Album | null;

  if (!album) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{album.title}</h1>
        {album.description && (
          <p className="text-gray-600 mt-2">{album.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {album.photos.map((photo) => (
          <div key={photo.id} className="group relative">
            <div className="relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={photo.url}
                alt={photo.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-semibold">{photo.title}</h3>
              {photo.description && (
                <p className="text-gray-600">{photo.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 