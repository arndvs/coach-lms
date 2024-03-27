import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

// import the Mux SDK
import Mux from '@mux/mux-node';
const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

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

    // VIDEO UPLOAD
    // if the videoUrl exists in the values, upload the video to Mux
    if (values.videoUrl) {
      // find the existing muxData for the chapter
      const existingMuxData = await db.muxData.findFirst({
        where: {
          chapterId: params.chapterId
        }
      });

      // if the existing muxData exists, delete the asset and the muxData
      if (existingMuxData) {
        // delete the asset from Mux
        await Video.Assets.del(existingMuxData.assetId);
        // delete the muxData from the database
        await db.muxData.delete({
          // delete the muxData where the id matches the existingMuxData id
          where: {
            id: existingMuxData.id
          }
        });
      }

      // create a new asset in Mux
      const asset = await Video.Assets.create({
        // set the input to the videoUrl
        input: values.videoUrl,
        // set the playback policy to public
        playback_policy: 'public',
        // set the new asset to be a master asset
        test: false
      });

      // create a new muxData in the database
      await db.muxData.create({
        // set the chapterId to the chapterId, the assetId to the asset id, and the playbackId to the asset playback id
        data: {
          chapterId: params.chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id
        }
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log('[COURSES_CHAPTER_ID]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
