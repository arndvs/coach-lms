import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// create a new chapter
export async function POST(
  // access the request objectv
  req: Request,
  // get the course ID from the request parameters
  { params }: { params: { courseId: string } }
) {
  try {
    // get the user ID from the clerk session
    const { userId } = auth();
    // get the title from the request body
    const { title } = await req.json();
    // if the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    // check if the user is the owner of the course
    const courseOwner = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId
      }
    });
    // if the user isn't the course owner, return an unauthorized response
    if (!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // attempt to fetch the last chapter for positioning
    const lastChapter = await db.chapter.findFirst({
      where: {
        courseId: params.courseId
      },
      // order the chapters by position in descending order to get the last chapter
      orderBy: {
        position: 'desc'
      }
    });

    // if there is a last chapter, increment the position by 1, otherwise, set the position to 1
    const newPosition = lastChapter ? lastChapter.position + 1 : 1;

    // create a new chapter
    const chapter = await db.chapter.create({
      // pass in the title, course ID, and the new position
      data: {
        title,
        courseId: params.courseId,
        position: newPosition
      }
    });
    // return the chapter as JSON
    return NextResponse.json(chapter);
  } catch (error) {
    console.log('[CHAPTERS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
