import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// delete an attachment
export async function DELETE(
  // access the request object
  req: Request,
  // get the course ID and the attachment ID from the request parameters
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    // get the user ID from the clerk session
    const { userId } = auth();

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

    // delete the attachment by the course ID and the attachment ID
    const attachment = await db.attachment.delete({
      where: {
        courseId: params.courseId,
        id: params.attachmentId
      }
    });
    // return the attachment as JSON
    return NextResponse.json(attachment);
  } catch (error) {
    console.log('ATTACHMENT_ID', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
