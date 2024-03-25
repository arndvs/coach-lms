'use client';

import useDynamicReactQuill from '@/hooks/use-dynamic-react-quill';

import 'react-quill/dist/quill.snow.css';

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export const Editor = ({ onChange, value }: EditorProps) => {
  const DynamicReactQuill = useDynamicReactQuill();

  return (
    <div className="bg-white">
      <DynamicReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
