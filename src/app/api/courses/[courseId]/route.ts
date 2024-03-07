import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function PATCH(
  // get the request object
  req: Request,
  // get the request parameters from the response object
  {
    params
  }: // type definition for the request parameters
  { params: { courseId: string } }
) {
  try {
    // get the user ID from the clerk session
    const { userId } = auth();
    // get the course ID from the request parameters object
    const { courseId } = params;
    // get the course values from the request body
    const values = await req.json();

    // if the user is not logged in, return an unauthorized response
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // update the course in the database
    const course = await db.course.update({
      // find the course by the id and the user id
      where: {
        id: courseId,
        userId
      },
      // update the course with the new values
      data: {
        // spread the values object
        ...values
      }
    });

    // return the course as JSON
    return NextResponse.json(course);
  } catch (error) {
    console.log('[COURSE_ID]', error);
    // return an internal server error
    return new NextResponse('Internal Error', { status: 500 });
  }
}
