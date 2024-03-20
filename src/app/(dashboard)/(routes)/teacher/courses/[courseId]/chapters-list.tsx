// chapters-list.tsx

'use client';

import { Chapter } from '@prisma/client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from '@hello-pangea/dnd';
import { Grip, Pencil } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ChaptersListProps {
  items: Chapter[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
  chapters,
  setChapters
}: ChaptersListProps) => {
  // state to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false);

  // set isMounted to true when the component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // rehydrate the chapters when the items change
  useEffect(() => {
    setChapters(items);
  }, [items, setChapters]);

  //   // handle drag and drop
  //   const onDragEnd = (result: DropResult) => {
  //     // if there is no destination, break out of the function
  //     if (!result.destination) return;

  //     // create a new array of chapters
  //     const items = Array.from(chapters);
  //     // remove the item from the source index and store it in reorderedItem
  //     const [reorderedItem] = items.splice(result.source.index, 1);

  //     // insert the reorderedItem at the destination index
  //     items.splice(result.destination.index, 0, reorderedItem);

  //     // get the start and end index of the reordered items
  //     const startIndex = Math.min(result.source.index, result.destination.index);
  //     const endIndex = Math.max(result.source.index, result.destination.index);

  //     // get the reordered chapters
  //     const updatedChapters = items.slice(startIndex, endIndex + 1);

  //     // set the chapters to the updated chapters
  //     // setChapters(items);

  //     // create a bulk update data array. This is the data that will be sent to the server
  //     // map over the updated chapters and return an object with the id and position
  //     const bulkUpdateData = updatedChapters.map((chapter) => ({
  //       id: chapter.id,
  //       position: items.findIndex((item) => item.id === chapter.id)
  //     }));

  //     console.log('Bulk update data:', bulkUpdateData);
  //     // call the onReorder function with the bulkUpdateData
  //     onReorder(bulkUpdateData);
  //   };

  const onDragEnd = (result: DropResult) => {
    // if there is no destination, break out of the function
    if (!result.destination) return;

    // create a new array of chapters
    const items = Array.from(chapters);
    // remove the item from the source index and store it in reorderedItem
    const [reorderedItem] = items.splice(result.source.index, 1);
    // insert the reorderedItem at the destination index
    items.splice(result.destination.index, 0, reorderedItem);

    // create a bulk update data array. This is the data that will be sent to the server
    const bulkUpdateData = items.map((chapter, index) => ({
      id: chapter.id,
      position: index
    }));

    console.log('Bulk update data:', bulkUpdateData);
    // set the chapters state to the reordered items
    setChapters(items);
    // call the onReorder function with the bulkUpdateData
    onReorder(bulkUpdateData);
  };

  // fixes hydration mismatch - doesn't display in server side rendering, only in client side
  // drag and drop library is not optimized for server side
  if (!isMounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chapters">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      'mb-4 flex items-center gap-x-2 rounded-md border border-slate-200 bg-slate-200 text-sm text-slate-700',
                      chapter.isPublished &&
                        'border-sky-200 bg-sky-100 text-sky-700'
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        'rounded-l-md border-r border-r-slate-200 px-2 py-3 transition hover:bg-slate-300',
                        chapter.isPublished &&
                          'border-r-sky-200 hover:bg-sky-200'
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {chapter.title}
                    <div className="ml-auto flex items-center gap-x-2 pr-2">
                      {chapter.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          'bg-slate-500',
                          chapter.isPublished && 'bg-sky-700'
                        )}
                      >
                        {chapter.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(chapter.id)}
                        className="h-4 w-4 cursor-pointer transition hover:opacity-75"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
