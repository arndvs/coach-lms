'use client';

import qs from 'query-string';
import { IconType } from 'react-icons';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';

interface CategoryItemProps {
  label: string;
  value?: string;
  icon?: IconType;
}

export const CategoryItem = ({
  label,
  value,
  icon: Icon
}: CategoryItemProps) => {
  // Get the current pathname, router, and search params
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current category ID and title from the search params
  const currentCategoryId = searchParams.get('categoryId');
  const currentTitle = searchParams.get('title');

  // Determine if the category item is selected
  const isSelected = currentCategoryId === value;

  // Handle the category item click event
  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          title: currentTitle,
          categoryId: isSelected ? null : value
        }
      },
      { skipNull: true, skipEmptyString: true }
    );
    // Push the new URL to the router
    router.push(url);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-x-1 rounded-full border border-slate-200 px-3 py-2 text-sm transition hover:border-sky-700',
        isSelected && 'border-sky-700 bg-sky-200/20 text-sky-800'
      )}
      type="button"
    >
      {Icon && <Icon size={20} />}
      <div className="truncate">{label}</div>
    </button>
  );
};
