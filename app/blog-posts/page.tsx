// app/blog/page.tsx
// This component displays a list of all blog posts
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';

import SanitizedHtmlDisplay from '@/components/SanitizedHtmlDisplay';
import BlogSearchInput from '@/components/BlogSearchInput';

// Define the expected structure of a blog post for type safety
interface BlogPost {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  // Add other fields here if your /api/posts GET route returns them and you need them on this page
}

// Function to fetch posts, now accepting an optional search query
async function getPosts(query?: string): Promise<BlogPost[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(`${baseUrl}/api/posts`);

  if (query) {
    url.searchParams.append('q', query); // Add the search query as a URL parameter
  }

  console.log(`Fetching all posts from URL: ${url.toString()}`); // Keep this for debugging if needed

  const res = await fetch(url.toString(), {
    cache: 'no-store', // This tells Next.js not to cache the result, always fetch fresh data
  });

  if (!res.ok) {
    console.error(`API fetch error for all posts: ${res.status} - ${res.statusText} for URL: ${url.toString()}`);
    throw new Error('Failed to fetch posts');
  }

  return res.json(); // Parse the JSON response
}

// BlogListPage is now a Server Component that receives searchParams
export default async function BlogListPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {

  // --- CRITICAL FIX: Explicitly await searchParams and destructure 'q' ---
  // This directly addresses the "searchParams should be awaited" error.
  // We'll await the whole object and then destructure or access.
  const awaitedSearchParams = await Promise.resolve(searchParams); // Ensure it's resolved

  const query = typeof awaitedSearchParams.q === 'string' ? awaitedSearchParams.q : (Array.isArray(awaitedSearchParams.q) ? awaitedSearchParams.q[0] : '');

  // Fetch posts, passing the extracted query
  const posts = await getPosts(query);

  // Get authentication status
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center sm:text-left">
            All Blog Posts
          </h1>
          {isLoggedIn && (
            <Link
              href="/admin/posts/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Post
            </Link>
          )}
        </div>

        {/* Render our Client Component for the search input */}
        <div className="mb-8">
          <BlogSearchInput initialQuery={query} />
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-gray-600">
            {query ? `No posts found matching "${query}".` : "No blog posts found."}
            {isLoggedIn && " Click 'Create New Post' to add one!"}
          </p>
        ) : (
          <ul className="space-y-6">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <Link href={`/blog/${post.id}`} className="block hover:underline">
                  <h2 className="text-2xl font-bold text-blue-600 hover:text-blue-800 mb-2">
                    {post.title}
                  </h2>
                </Link>
                <SanitizedHtmlDisplay
                  html={post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                />
                <p className="text-gray-500 text-sm mt-3">
                  Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}