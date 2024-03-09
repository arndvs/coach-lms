import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// create a new attachment
export async function POST(
  // access the request object
  req: Request,
  // get the course ID from the request parameters
  { params }: { params: { courseId: string } }
) {
  try {
    // get the user ID from the clerk session
    const { userId } = auth();
    // get the URL from the request body
    const { url } = await req.json();
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

    // create a new attachment with the URL and the course ID
    const attachment = await db.attachment.create({
      data: {
        url,
        // url.split('/').pop() returns the last part of the URL
        name: url.split('/').pop(),
        courseId: params.courseId
      }
    });

    // return the attachment as JSON
    return NextResponse.json(attachment);
  } catch (error) {
    console.log('COURSE_ID_ATTACHMENTS', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
