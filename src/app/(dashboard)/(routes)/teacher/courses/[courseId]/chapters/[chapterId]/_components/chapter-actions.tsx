'use client';

import axios from 'axios';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/modals/confirm-modal';

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // publish or unpublish the chapter
  const onClick = async () => {
    try {
      // set the loading state to true
      setIsLoading(true);

      // if the chapter is published, make a patch request to unpublish the chapter
      if (isPublished) {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/unpublish`
        );
        // show a success toast
        toast.success('Chapter unpublished');
      }
      // if the chapter is not published, make a patch request to publish the chapter
      else {
        await axios.patch(
          `/api/courses/${courseId}/chapters/${chapterId}/publish`
        );
        // show a success toast
        toast.success('Chapter published');
      }

      // refresh the router
      router.refresh();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // delete the chapter
  const onDelete = async () => {
    try {
      // set the loading state to true
      setIsLoading(true);
      // make a delete request to the server to delete the chapter
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
      // show a success toast
      toast.success('Chapter deleted');
      // refresh the router
      router.refresh();
      //redirect to the course page
      router.push(`/teacher/courses/${courseId}`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button
          size="sm"
          disabled={isLoading}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
