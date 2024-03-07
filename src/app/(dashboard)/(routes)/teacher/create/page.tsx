'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required'
  })
});

const CreatePage = () => {
  // initialize router, used to navigate between pages
  const router = useRouter();

  // create form
  const form = useForm<z.infer<typeof formSchema>>({
    //resolver is a hook form feature that allows us to use zod to validate our form
    resolver: zodResolver(formSchema),

    defaultValues: {
      title: ''
    }
  });

  // extract form state
  const { isSubmitting, isValid } = form.formState;

  // handle form submission - takes in the form values and sends a post request to the server
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post('/api/course', values);

      router.push(`/teacher/courses/${response.data.id}`);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-5xl p-6 md:items-center md:justify-center">
      <div>
        <h1 className="text-2xl">Name your course</h1>

        <p className="text-sm text-slate-600">
          What would you like to name your course? Don&apos;t worry, you can
          change this later.
        </p>

        {/* instiate the form - spread the form hook  */}
        <Form {...form}>
          {/* pass the form hook onSubmit */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-8 space-y-8"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course title</FormLabel>

                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g. 'Advanced web development'"
                      //   spread the field hook - pass onChange, onBlur, value, name, and ref
                      {...field}
                    />
                  </FormControl>

                  <FormDescription>
                    What will you teach in this course?
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Link href="/">
                <Button
                  type="button"
                  variant="ghost"
                >
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePage;
