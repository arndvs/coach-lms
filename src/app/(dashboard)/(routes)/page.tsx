import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div>
      test
      <UserButton />
      This is a protected page
    </div>
  );
}
