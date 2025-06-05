// src/app/admin/posts/[id]/edit/page.tsx
import { notFound, redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server'; // Import auth for server-side checks

import EditPostClient from '@/components/EditPostClient'; // Import the client component

const prisma = new PrismaClient();

interface EditPostPageProps {
  params: {
    id: string; // The post ID from the URL
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const postId = params.id;
  const { userId } = await auth(); // Get the authenticated user's Clerk ID on the server

  // Server-side authentication check
  if (!userId) {
    redirect('/sign-in'); // Redirect to sign-in if not authenticated
  }

  // Fetch the post from the database
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          clerkId: true, // Need clerkId to compare with current user's userId
          name: true,
          email: true,
        },
      },
    },
  });

  // Handle post not found
  if (!post) {
    notFound(); // Next.js built-in notFound function will render closest not-found.tsx
  }

  // Server-side authorization check: Ensure the logged-in user is the author
  // This is a critical security check before rendering the editable form
  if (post.author.clerkId !== userId) {
    // You could redirect to a specific "access denied" page, or a general post view
    redirect(`/blog/${post.id}?error=access_denied`); // Example redirect
    // Alternatively, you could render a less detailed error page here:
    // return <div className="text-center p-12 text-red-600">You are not authorized to edit this post.</div>;
  }

  // If authenticated and authorized, pass the post data to the client component
  // Ensure author.name is a string (not null) to match the Post type
  const safePost = {
    ...post,
    author: {
      ...post.author,
      name: post.author.name ?? '', // Convert null to empty string
    },
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* The EditPostClient handles rendering the form and delete button */}
      <EditPostClient initialPost={safePost} currentUserId={userId} />
    </div>
  );
}