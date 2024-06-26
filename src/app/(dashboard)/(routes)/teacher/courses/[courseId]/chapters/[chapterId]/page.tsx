import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, LayoutDashboard, Video } from 'lucide-react';

import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { ChapterTitleForm } from './_components/chapter-title-form';
import { ChapterDescriptionForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/_components/chapter-description-form';
import { ChapterAccessForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/_components/chapter-access-form';
import { ChapterVideoForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/_components/chapter-video-form';
import { Banner } from '@/components/banner';
import { ChapterActions } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters/[chapterId]/_components/chapter-actions';

const ChapterIdPage = async ({
  params
}: {
  // chapter consists of a courseId and a chapterId
  params: { courseId: string; chapterId: string };
}) => {
  // get the userId from the auth function
  const { userId } = auth();

  // if there is no userId, redirect to the homepage
  if (!userId) {
    return redirect('/');
  }
  // get the chapter from the database
  const chapter = await db.chapter.findUnique({
    // find the chapter where the id matches the chapterId and the courseId matches the courseId
    where: {
      id: params.chapterId,
      courseId: params.courseId
    },
    // include the muxData
    include: {
      muxData: true
    }
  });

  // if there is no chapter, redirect to the homepage
  if (!chapter) {
    //TODO: Redirect to learn homepage
    return redirect('/');
  }

  // required fields for the chapter include the title, description, and videoUrl
  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

  // get the total number of required fields
  const totalFields = requiredFields.length;

  // get the number of completed fields
  const completedFields = requiredFields.filter(Boolean).length;

  // create a completion text that shows the number of completed fields out of the total fields
  const completionText = `(${completedFields}/${totalFields})`;

  // check if all the required fields in the requiredFields array are true
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="mb-6 flex items-center text-sm transition hover:opacity-75"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to course setup
            </Link>
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter Creation</h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Customize your chapter</h2>
              </div>
              <ChapterTitleForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">Access Settings</h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">Add a video</h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              chapterId={params.chapterId}
              courseId={params.courseId}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
