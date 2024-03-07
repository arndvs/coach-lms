import { auth } from '@clerk/nextjs';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const handleAuth = () => {
  // Get the user ID from the clerk session
  const { userId } = auth();
  // If the user is not logged in, throw an error
  if (!userId) throw new Error('Unauthorized');
  // Return the user ID
  return { userId };
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  //   Define as many FileRoutes as you like, each with a unique routeSlug - takes in a file type and a middleware function

  // upload an image for a course
  courseImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(() => handleAuth())
    .onUploadComplete(() => {
      // This code RUNS ON YOUR SERVER after upload})
    }),

  // upload a file for a course
  courseAttachment: f(['text', 'image', 'video', 'audio', 'pdf'])
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),

  // upload a video for a chapter
  chapterVideo: f({ video: { maxFileCount: 1, maxFileSize: '512GB' } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {})
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
