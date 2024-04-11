import { auth } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  return userId;
}
