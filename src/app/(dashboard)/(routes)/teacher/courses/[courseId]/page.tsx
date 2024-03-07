import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';

import { db } from '@/lib/db';
import { IconBadge } from '@/components/icon-badge';

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
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;