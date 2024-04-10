import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // get the user ID from the clerk session
    const { userId } = auth();

    // if the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // get the course from the database
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId
      },
      include: {
        chapters: {
          include: {
            muxData: true
          }
        }
      }
    });

    // if the course does not exist, return a not found response
    if (!course) {
      return new NextResponse('Not found', { status: 404 });
    }

    // loop through the chapters of the course
    const hasPublishedChapter = course.chapters.some(
      (chapter) => chapter.isPublished
    );

    // if the course is missing required fields, return a bad request response
    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId ||
      !hasPublishedChapter
    ) {
      return new NextResponse('Missing required fields', { status: 401 });
    }

    // update the course in the database
    const publishedCourse = await db.course.update({
      where: {
        id: params.courseId,
        userId
      },
      data: {
        isPublished: true
      }
    });

    // return the updated course
    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log('[COURSE_ID_PUBLISH]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
