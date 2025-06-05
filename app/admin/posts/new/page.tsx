// src/app/admin/posts/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import PostFormClient from '@/components/PostFormClient';

export default function NewPostPage() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600">Loading authentication...</p>
      </div>
    );
  }

  if (!userId) {
    router.push('/sign-in');
    return null;
  }

  const handleCreatePost = async (formData: { title: string; content: string; published: boolean; videoUrl?: string; imageUrl?: string }) => { // <--- MODIFIED: Added imageUrl to type
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      alert('Post created successfully!');
      router.push(`/blog/${newPost.id}`);
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      let message = 'Could not create post.';
      if (error instanceof Error) {
        message = error.message;
      }
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 lg:p-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Create New Blog Post
        </h1>
        <PostFormClient
          onSubmit={handleCreatePost}
          isSubmitting={isSubmitting}
          submitButtonText="Create Post"
        />
      </div>
    </div>
  );
}