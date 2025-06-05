// src/components/AuthButtons.tsx
'use client'; // This component must be a Client Component

import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm mb-6">
      <SignedIn>
        {/* User is signed in */}
        <p className="text-gray-700 text-lg font-medium">Welcome back!</p>
        <div className="flex items-center gap-3">
          {/* Clerk's pre-built user menu (Clerk handles its internal styling) */}
          <UserButton afterSignOutUrl="/" />
          {/* Custom sign out button */}
          <SignOutButton>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={() => console.log('Signed out!')}
            >
              Sign Out
            </button>
          </SignOutButton>
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Go to Admin Area
          </Link>
        </div>
      </SignedIn>
      <SignedOut>
        {/* User is signed out */}
        <p className="text-gray-600 text-lg">You are signed out.</p>
        <div className="flex items-center gap-3">
          {/* Button to open Clerk's sign-in modal */}
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
              Sign In
            </button>
          </SignInButton>
          <Link
            href="/auth/signup"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Sign Up
          </Link>
        </div>
      </SignedOut>
    </div>
  );
}