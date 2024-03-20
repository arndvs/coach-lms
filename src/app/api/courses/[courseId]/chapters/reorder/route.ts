// reorder route

import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// rehydrate the chapters when the items change order
export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    // get the userId from the clerk auth
    const { userId } = auth();

    // if there is no userId, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // get the list from the request body
    const { list } = await req.json();
    console.log('Received list:', list);

    // check if the user owns the course
    const ownCourse = await db.course.findUnique({
      // find the course by the courseId and userId
      where: {
        id: params.courseId,
        userId: userId
      }
    });

    // if the user does not own the course, return an unauthorized response
    if (!ownCourse) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // loop over the list and update the position of the chapters
    for (let item of list) {
      await db.chapter.update({
        where: { id: item.id },
        data: { position: item.position }
      });
    }

    // get the reordered chapters
    const reorderedChapters = await db.chapter.findMany({
      where: { courseId: params.courseId },
      orderBy: { position: 'asc' }
    });

    // return the reordered chapters
    return new NextResponse(JSON.stringify({ chapters: reorderedChapters }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.log('[REORDER]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
