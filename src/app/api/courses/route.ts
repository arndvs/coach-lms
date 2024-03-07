import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

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
