// chapters-form.tsx

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter, Course } from '@prisma/client';
import axios from 'axios';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { ChaptersList } from '@/app/(dashboard)/(routes)/teacher/courses/[courseId]/chapters-list';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1)
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  // state to track if the form is in Creating mode
  const [isUpdating, setIsUpdating] = useState(false);

  const [chapters, setChapters] = useState(initialData.chapters);

  // toggle Creating mode
  const toggleCreating = () => {
    setIsCreating((current) => !current);
  };

  // initialize router, used to navigate between pages
  const router = useRouter();

  // create form
  const form = useForm<z.infer<typeof formSchema>>({
    //resolver is a hook form feature that allows us to use zod to validate our form
    resolver: zodResolver(formSchema),
    // set the default values of the form to the initial data
    defaultValues: {
      title: ''
    }
  });

  // state to track if the form is submitting and if it is valid
  const { isSubmitting, isValid } = form.formState;

  // handle form submission - takes in the form values and sends a post request to the server
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // patch is a request to update a resource
      await axios.post(`/api/courses/${courseId}/chapters`, values);
      toast.success('Chapter created');
      toggleCreating();
      // refresh the server component to get the updated data
      form.reset();
      // fetch the updated chapters
      const response = await axios.get(`/api/courses/${courseId}/chapters`);
      const updatedChapters = response.data;
      // update the chapters state in the ChaptersList component
      setChapters(updatedChapters);
    } catch {
      toast.error('Something went wrong');
    }
  };

  // handle reordering of chapters - takes in an array of chapters and sends a put request to the server
  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);
      const response = await axios.put(
        `/api/courses/${courseId}/chapters/reorder`,
        {
          list: updateData
        }
      );
      const reorderedChapters = response.data.chapters;
      setChapters(reorderedChapters);
      toast.success('Chapters reordered');
    } catch {
      toast.error('Something went wrong');
      // if an error occurs, fetch the chapters from the server to ensure consistency
      const response = await axios.get(`/api/courses/${courseId}/chapters`);
      const chapters = response.data;
      setChapters(chapters);
    } finally {
      setIsUpdating(false);
    }
  };

  // fetch chapters and update the state
  const fetchChapters = useCallback(async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}/chapters`);
      const chapters = response.data;
      setChapters(chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchChapters();
  }, [courseId, fetchChapters]);

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="relative mt-6 rounded-md border bg-slate-100 p-4">
      {isUpdating && (
        <div className="rounded-m absolute right-0 top-0 flex h-full w-full items-center justify-center bg-slate-500/20">
          <Loader2 className="h-6 w-6 animate-spin text-sky-700" />
        </div>
      )}
      <div className="flex items-center justify-between font-medium">
        Course Chapters
        <Button
          onClick={toggleCreating}
          variant="ghost"
        >
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add a chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Introduction to course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            'mt-2 text-sm',
            !initialData.chapters.length && 'italic text-slate-500'
          )}
        >
          {!initialData.chapters.length && 'No chapters'}
          <ChaptersList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters || []}
            chapters={chapters}
            setChapters={setChapters}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-muted-foreground mt-4 text-xs">
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  );
};
