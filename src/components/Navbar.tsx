"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-800">
            Photo Blog
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link href="/albums" className="text-gray-600 hover:text-gray-800">
              Albums
            </Link>
            
            {session ? (
              <>
                <Link href="/upload" className="text-gray-600 hover:text-gray-800">
                  Upload
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gray-600 hover:text-gray-800">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 