import { NextRequest, NextResponse } from 'next/server';
import { isValidPassword } from './lib/isValidPassword';

export async function middleware(req: NextRequest) {
  const start = Date.now();

  if (!(await isAuthenticated(req))) {
    console.log('Authentication failed');
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic' },
    });
  }

  const duration = Date.now() - start;
  console.log(`Middleware executed in ${duration}ms`);

  return NextResponse.next();
}

async function isAuthenticated(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('Authorization header is missing or invalid format');
    return false;
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    );
    const [username, password] = credentials.split(':');

    const isAuthenticated =
      username === process.env.ADMIN_USERNAME &&
      (await isValidPassword(
        password,
        process.env.HASHED_ADMIN_PASSWORD as string
      ));

    if (!isAuthenticated) {
      console.log('Invalid username or password');
    }

    return isAuthenticated;
  } catch (error) {
    console.error('Error parsing authentication header:', error);
    return false;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
