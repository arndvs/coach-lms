'use client';

import { EditorContent, EditorRoot, JSONContent } from 'novel';
import { useState } from 'react';

const NovelEditor = () => {
  const [content, setContent] = useState<JSONContent | undefined>(undefined);

  return (
    <EditorRoot>
      <EditorContent
        initialContent={content}
        onUpdate={({ editor }) => {
          const json = editor.getJSON();
          setContent(json);
        }}
      >
        {/* Add the required children prop */}
        <div>{/* Add any additional content or placeholder */}</div>
      </EditorContent>
    </EditorRoot>
  );
};

export default NovelEditor;
