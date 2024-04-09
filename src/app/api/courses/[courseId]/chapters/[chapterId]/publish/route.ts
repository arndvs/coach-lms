import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// Publish the chapter
export async function PATCH(
  req: Request,
  // get the courseId and chapterId from the params
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    // get the userId from the clerk session
    const { userId } = auth();

    // if the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // check if the user is the owner of the course
    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      }
    });

    // if the user isn't the course owner, return an unauthorized response
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // get the chapter from the database
    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      }
    });

    // get the muxData for the chapter
    const muxData = await db.muxData.findUnique({
      where: {
        chapterId: params.chapterId
      }
    });

    // if there is no chapter, muxData, or chapter title, description, or videoUrl, return a bad request response
    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // update the chapter in the database
    const publishedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      },
      data: {
        isPublished: true
      }
    });

    return NextResponse.json(publishedChapter);
  } catch (error) {
    console.log('[CHAPTER_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
