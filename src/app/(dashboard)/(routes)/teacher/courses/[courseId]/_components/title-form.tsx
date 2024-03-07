'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required'
  })
});

export const TitleForm = ({ initialData, courseId }: TitleFormProps) => {
  // state to track if the form is in edit mode
  const [isEditing, setIsEditing] = useState(false);

  // toggle edit mode
  const toggleEdit = () => setIsEditing((current) => !current);

  // initialize router, used to navigate between pages
  const router = useRouter();

  // create form
  const form = useForm<z.infer<typeof formSchema>>({
    //resolver is a hook form feature that allows us to use zod to validate our form
    resolver: zodResolver(formSchema),
    // set the default values of the form to the initial data
    defaultValues: initialData
  });

  // state to track if the form is submitting and if it is valid
  const { isSubmitting, isValid } = form.formState;

  // handle form submission - takes in the form values and sends a post request to the server
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // patch is a request to update a resource
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success('Course updated');
      toggleEdit();
      // refresh the server component to get the updated data
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course title
        <Button
          onClick={toggleEdit}
          variant="ghost"
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="mr-2 h-4 w-4" />
              Edit title
            </>
          )}
        </Button>
      </div>
      {!isEditing && <p className="mt-2 text-sm">{initialData.title}</p>}
      {isEditing && (
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
                      placeholder="e.g. 'Advanced web development'"
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
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
