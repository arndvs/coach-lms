// chapters route

import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// create a new chapter
export async function POST(
  // access the request object
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

    // fetch the total number of chapters for the course
    const chapterCount = await db.chapter.count({
      where: {
        courseId: params.courseId
      }
    });

    // if there is a last chapter, increment the position by 1, otherwise, set the position to 1
    const newPosition = chapterCount;

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

// fetch chapters for a course
export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const chapters = await db.chapter.findMany({
      where: {
        courseId: params.courseId
      },
      orderBy: {
        position: 'desc'
      }
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.log('[CHAPTERS]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
