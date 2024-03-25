import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PATCH(
  req: Request,
  // get the courseId and chapterId from the params
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    // get the userId from the clerk session
    const { userId } = auth();
    // get the values from the request body - extract isPublished from the values
    // users can't update the isPublished field - isPublished is controlled by separate api route
    const { isPublished, ...values } = await req.json();

    // if the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // check if the user is the owner of the course
    const ownCourse = await db.course.findUnique({
      where: {
        // course id and user id must match
        id: params.courseId,
        userId
      }
    });

    // if the user isn't the course owner, return an unauthorized response
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // update the chapter with the new values
    const chapter = await db.chapter.update({
      where: {
        // update the chapter where the id matches the chapterId and the courseId matches the courseId
        id: params.chapterId,
        courseId: params.courseId
      },
      // set the new values spread from the request body
      data: {
        ...values
      }
    });

    // TODO: Handle Video Upload

    return NextResponse.json(chapter);
  } catch (error) {
    console.log('[COURSES_CHAPTER_ID]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
