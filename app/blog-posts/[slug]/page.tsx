// src/app/blog/[slug]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link'; // Make sure Link is imported

const prisma = new PrismaClient();

interface BlogPostPageProps {
  params: {
    slug: string; // The ID of the post
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { userId } = await auth();

  const { slug: postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId, published: true },
    include: {
      author: {
        select: {
          id: true,
          clerkId: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!post) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Post Not Found</h1>
        <p className="text-gray-600">The requested blog post does not exist or is not published.</p>
      </div>
    );
  }

  const isAuthor = userId && post.author.clerkId === userId;

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900 text-center md:text-left">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6 text-center md:text-left">
        By {post.author.name} on {new Date(post.createdAt).toLocaleDateString()}
        {isAuthor && (
          <span className="ml-4">
            <Link href={`/admin/posts/${postId}/edit`} className="text-blue-600 hover:underline">
              Edit Post
            </Link>
          </span>
        )}
      </p>

      {post.imageUrl && (
        <div className="mb-6">
          <Image
            src={post.imageUrl}
            alt={post.title}
            width={800}
            height={450}
            className="w-full h-auto rounded-lg object-cover"
            priority
          />
        </div>
      )}

      {post.videoUrl && (
        <div className="mb-6 aspect-w-16 aspect-h-9">
          <iframe
            src={post.videoUrl.replace("watch?v=", "embed/")}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          ></iframe>
        </div>
      )}

      <div className="prose lg:prose-lg break-words" dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* --- NEW: Button to go back to blog list --- */}
      <div className="mt-8 text-center"> {/* Added margin-top and text-center for the button */}
        <Link href="/blog" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out">
          &larr; Back to All Posts
        </Link>
      </div>
    </div>
  );
}