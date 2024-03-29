import { EditorBubble, useEditor } from 'novel';
import React, { Fragment, useEffect, type ReactNode } from 'react';

import { AISelector } from './ai-selector';

import {} from 'novel/plugins';
import { removeAIHighlight } from 'novel/extensions';
import { Button } from '@/components/ui/button';
import Magic from '@/components/ui/icons/magic';

interface GenerativeMenuSwitchProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = ({
  children,
  open,
  onOpenChange
}: GenerativeMenuSwitchProps) => {
  const { editor } = useEditor();

  useEffect(() => {
    if (!open && editor) {
      removeAIHighlight(editor);
    }
  }, [open, editor]);
  return (
    <EditorBubble
      tippyOptions={{
        placement: open ? 'bottom-start' : 'top',
        onHidden: () => {
          onOpenChange(false);
          editor?.chain().unsetHighlight().run();
        }
      }}
      className="border-muted bg-background flex w-fit max-w-[100vw] overflow-hidden rounded-md border shadow-xl"
    >
      {open && (
        <AISelector
          open={open}
          onOpenChange={onOpenChange}
        />
      )}
      {!open && (
        <Fragment>
          <Button
            className="gap-1 rounded-none text-purple-500"
            variant="ghost"
            onClick={() => onOpenChange(true)}
            size="sm"
          >
            <Magic className="h-5 w-5" />
            AI
          </Button>
          {children}
        </Fragment>
      )}
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
