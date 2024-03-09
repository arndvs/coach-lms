'use client';

import { Attachment, Course } from '@prisma/client';
import axios from 'axios';
import { File, Loader2, PlusCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
}

const formSchema = z.object({
  url: z.string().min(1)
});

export const AttachmentForm = ({
  initialData,
  courseId
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // create a new attachment with the URL and the course ID
      await axios.post(`/api/courses/${courseId}/attachments`, values);
      // return success message
      toast.success('Course updated');
      // toggle the edit mode
      toggleEdit();
      // refresh the page
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const onDelete = async (id: string) => {
    try {
      // set the deleting ID to the passed ID
      setDeletingId(id);
      // delete the attachment
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`);
      // return success message
      toast.success('Attachment deleted');
      // refresh the page
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 rounded-md border bg-slate-100 p-4">
      <div className="flex items-center justify-between font-medium">
        Course attachments
        <Button
          onClick={toggleEdit}
          variant="ghost"
        >
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="mt-2 text-sm italic text-slate-500">
              No attachments yet
            </p>
          )}
          {initialData.attachments.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex w-full items-center rounded-md border border-sky-200 bg-sky-100 p-3 text-sky-700"
                >
                  <File className="mr-2 h-4 w-4 flex-shrink-0" />
                  <p className="line-clamp-1 text-xs">{attachment.name}</p>
                  {/* if deleting, display a spinner */}
                  {deletingId === attachment.id && (
                    <div className="ml-auto transition hover:opacity-75">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {/* if not deleting, display delete button */}
                  {deletingId !== attachment.id && (
                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="ml-auto transition hover:opacity-75"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(url) => {
              if (url) {
                onSubmit({ url: url });
              }
            }}
          />
          <div className="text-muted-foreground mt-4 text-xs">
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  );
};
