import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
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
    const unpublishedChapter = await db.chapter.update({
      where: {
        id: params.chapterId,
        courseId: params.courseId
      },
      // update the chapter isPublished status to false
      data: {
        isPublished: false
      }
    });

    // get all the published chapters in the course
    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: params.courseId,
        isPublished: true
      }
    });

    // if there are no published chapters in the course, set the course to unpublished
    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: params.courseId
        },
        data: {
          isPublished: false
        }
      });
    }

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.log('[CHAPTER_UNPUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
