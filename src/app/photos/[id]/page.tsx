"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
  };
};

type Photo = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  comments: Comment[];
};

type Props = {
  params: {
    id: string;
  };
};

export default function PhotoPage({ params }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await fetch(`/api/photos/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch photo");
        }
        const data = await response.json();
        setPhoto(data);
      } catch (error) {
        setError("Failed to load photo");
      }
    };

    fetchPhoto();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: comment,
          photoId: params.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newComment = await response.json();
      setPhoto((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        };
      });
      setComment("");
    } catch (error) {
      setError("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      setPhoto((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
        };
      });
    } catch (error) {
      setError("Failed to delete comment");
    }
  };

  if (!photo) {
    return (
      <div className="max-w-4xl mx-auto text-center py-8">
        {error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={photo.url}
          alt={photo.title}
          fill
          className="object-cover"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold">{photo.title}</h1>
        {photo.description && (
          <p className="text-gray-600 mt-2">{photo.description}</p>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Comments</h2>

        {session ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
            <button
              type="submit"
              disabled={loading || !comment.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post Comment"}
            </button>
          </form>
        ) : (
          <p className="text-gray-600">
            Please{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-indigo-600 hover:text-indigo-500"
            >
              sign in
            </button>{" "}
            to leave a comment.
          </p>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {photo.comments.map((comment) => (
            <div key={comment.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {comment.user.name || "Anonymous"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {session?.user && (session.user as SessionUser).id === comment.user.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-600 hover:text-red-500"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 