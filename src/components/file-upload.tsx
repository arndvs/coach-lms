'use client';

import { ourFileRouter } from '@/app/api/uploadthing/core';
import { UploadDropzone } from '@/lib/uploadthing';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    <UploadDropzone
      // endpoints are defined in the uploadthing core file
      endpoint={endpoint}
      // onClientUploadComplete is a callback that runs when the file is uploaded
      onClientUploadComplete={(res) => {
        // res is an array of the uploaded files
        onChange(res?.[0].url);
      }}
      // onUploadError is a callback that runs if the file upload fails
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`);
      }}
    />
  );
};
