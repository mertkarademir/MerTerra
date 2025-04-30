"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [albums, setAlbums] = useState<{ id: string; title: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const albumId = formData.get("albumId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!file) {
      setError("Please select a file");
      setLoading(false);
      return;
    }

    try {
      // First, upload to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", "photo_blog");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const cloudinaryData = await cloudinaryResponse.json();

      // Then, save to our database
      const response = await fetch("/api/photos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          url: cloudinaryData.secure_url,
          cloudinaryId: cloudinaryData.public_id,
          albumId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save photo");
      }

      router.push(`/albums/${albumId}`);
    } catch (error) {
      setError("An error occurred while uploading the photo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Upload Photo</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="albumId" className="block text-sm font-medium text-gray-700">
            Album
          </label>
          <select
            id="albumId"
            name="albumId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select an album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700">
            Photo
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept="image/*"
            required
            className="mt-1 block w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Photo"}
        </button>
      </form>
    </div>
  );
} 