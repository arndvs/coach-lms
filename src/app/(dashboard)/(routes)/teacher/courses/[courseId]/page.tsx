import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks
} from 'lucide-react';

import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';
import { TitleForm } from './_components/title-form';
import { DescriptionForm } from './_components/description-form';
import { ImageForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/image-form';
import { CategoryForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/category-form';
import { PriceForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/price-form';
import { AttachmentForm } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/_components/attachment-form';

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  // Get the user ID from the clerk session
  const { userId } = auth();

  // If the user is not logged in, redirect to the root page
  if (!userId) {
    return redirect('/');
  }

  // get the course from the database
  const course = await db.course.findUnique({
    // find the course by the id
    where: {
      id: params.courseId
    },
    // include the attachments
    include: {
      attachments: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  // get the categories from the database
  const categories = await db.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });

  // If the course does not exist, redirect to the root page
  if (!course) {
    return redirect('/');
  }

  // array of required form fields
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId
  ];

  // get the number of required fields
  const totalFields = requiredFields.length;
  // get the number of completed fields
  const completedFields = requiredFields.filter(Boolean).length;
  // number of completed fields out of the total fields
  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm
            initialData={course}
            courseId={course.id}
          />
          <DescriptionForm
            initialData={course}
            courseId={course.id}
          />
          <ImageForm
            initialData={course}
            courseId={course.id}
          />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id
            }))}
          />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Course chapters</h2>
            </div>
            <div>TODO: Chapters</div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={CircleDollarSign} />
              <h2 className="text-xl">Sell your course</h2>
            </div>
            <PriceForm
              initialData={course}
              courseId={course.id}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h2 className="text-xl">Resources & Attachments</h2>
            </div>
            <AttachmentForm
              initialData={course}
              courseId={course.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
