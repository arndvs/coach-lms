// useMemo is used to prevent the component from being re-rendered on every change

import { useMemo } from 'react';
// dynamic is next.js's function for dynamic imports
import dynamic from 'next/dynamic';

const useDynamicReactQuill = () => {
  return useMemo(
    // return
    () =>
      // dynamic import the react-quill library
      dynamic(
        () =>
          // import the react-quill library
          import('react-quill'),
        // options object with ssr set to false
        { ssr: false }
      ),
    // dependencies array
    []
  );
};

export default useDynamicReactQuill;
