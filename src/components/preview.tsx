'use client';

import useDynamicReactQuill from '@/hooks/use-dynamic-react-quill';

import 'react-quill/dist/quill.bubble.css';

interface PreviewProps {
  value: string;
}

export const Preview = ({ value }: PreviewProps) => {
  const DynamicReactQuill = useDynamicReactQuill();

  return (
    <DynamicReactQuill
      theme="bubble"
      value={value}
      readOnly
    />
  );
};
