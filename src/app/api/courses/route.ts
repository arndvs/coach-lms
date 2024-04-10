import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';
import Mux from '@mux/mux-node';

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

// delete a course
export async function DELETE(
  req: Request,
  // get the course ID from the request parameters
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
        userId: userId
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
    for (const chapter of course.chapters) {
      // if the chapter has mux data, delete the asset
      if (chapter.muxData?.assetId) {
        await Video.Assets.del(chapter.muxData.assetId);
      }
    }

    // delete the course from the database
    const deletedCourse = await db.course.delete({
      where: {
        id: params.courseId
      }
    });

    // return the deleted course
    return NextResponse.json(deletedCourse);
  } catch (error) {
    console.log('[COURSE_ID_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

// Create a new course
export async function POST(req: Request) {
  try {
    // Get the user ID from the clerk session
    const { userId } = auth();

    // Get the course title from the request body
    const { title } = await req.json();

    // If the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Create a new course in the database
    const course = await db.course.create({
      // pass in the user id and the course title
      data: {
        userId,
        title
      }
    });

    // Return the course as JSON
    return NextResponse.json(course);
  } catch (error) {
    console.log('[COURSES]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
