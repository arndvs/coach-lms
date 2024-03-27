'use client';
import { defaultEditorContent } from '@/lib/content';
import React, { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorContent,
  type JSONContent,
  EditorInstance,
  EditorCommandList,
  EditorBubble
} from 'novel';
import { ImageResizer, handleCommandNavigation } from 'novel/extensions';
import { defaultExtensions } from './extensions';

import { NodeSelector } from './selectors/node-selector';
import { LinkSelector } from './selectors/link-selector';
import { ColorSelector } from './selectors/color-selector';

import { TextButtons } from './selectors/text-buttons';
import { slashCommand, suggestionItems } from './slash-command';
import GenerativeMenuSwitch from './generative/generative-menu-switch';
import { handleImageDrop, handleImagePaste } from 'novel/plugins';
import { uploadFn } from './image-upload';
import { Separator } from '@radix-ui/react-separator';

const NovelEditor = () => {
  const [initialContent, setInitialContent] = useState<null | JSONContent>(
    null
  );
  const [saveStatus, setSaveStatus] = useState('Saved');

  const [openNode, setOpenNode] = useState(false);
  const [openColor, setOpenColor] = useState(false);
  const [openLink, setOpenLink] = useState(false);
  const [openAI, setOpenAI] = useState(false);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();

      window.localStorage.setItem('novel-content', JSON.stringify(json));
      setSaveStatus('Saved');
    },
    500
  );

  useEffect(() => {
    const content = window.localStorage.getItem('novel-content');
    if (content) setInitialContent(JSON.parse(content));
    else setInitialContent(defaultEditorContent);
  }, []);

  if (!initialContent) return null;
  const extensions = [...defaultExtensions, slashCommand];

  return (
    <EditorRoot>
      <EditorContent
        initialContent={initialContent}
        extensions={extensions}
        className="border-muted bg-background relative min-h-[500px] w-full max-w-screen-lg sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
        editorProps={{
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event)
          },
          handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
          handleDrop: (view, event, _slice, moved) =>
            handleImageDrop(view, event, moved, uploadFn),
          attributes: {
            class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`
          }
        }}
        onUpdate={({ editor }) => {
          debouncedUpdates(editor);
          setSaveStatus('Unsaved');
        }}
        slotAfter={<ImageResizer />}
      >
        {' '}
        <EditorCommand></EditorCommand>
        <EditorBubble>dfsdf</EditorBubble>
      </EditorContent>
    </EditorRoot>
  );
};

export default NovelEditor;
