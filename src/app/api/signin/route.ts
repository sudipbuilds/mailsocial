import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse, NextRequest } from 'next/server';

import { getDb } from '@/db';
import { orders, users } from '@/db/schema';
import { createAuth } from '@/lib/auth/config';
import { loginFormSchema } from '@/lib/validations';

function createResponseWithCookies(
  data: object,
  authResponse: Response,
  status = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  const setCookie = authResponse.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const validated = loginFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { email, otp } = validated.data;

    const auth = createAuth();
    const authenticated = await auth.api.getSession({
      headers: request.headers,
    });
    if (authenticated?.user || authenticated?.session) {
      return NextResponse.json({ error: 'Already logged in' }, { status: 400 });
    }

    const db = getDb();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      const authResponse = await auth.api.signInEmailOTP({
        headers: request.headers,
        body: { email, otp },
        asResponse: true,
      });

      return createResponseWithCookies({ message: 'Logged in successfully' }, authResponse);
    }

    const existingOrder = await db.query.orders.findFirst({
      where: and(
        eq(orders.customerEmail, email),
        eq(orders.paymentStatus, 'succeeded'),
        isNull(orders.refundedAt),
        isNull(orders.userId)
      ),
    });

    if (existingOrder) {
      const authResponse = await auth.api.signInEmailOTP({
        headers: request.headers,
        body: {
          email,
          otp,
          name: existingOrder.customerName,
          username: existingOrder.customerUsername,
        },
        asResponse: true,
      });

      const authData = (await authResponse.json()) as { user?: { id: string } };
      if (authData.user) {
        await db
          .update(orders)
          .set({ userId: authData.user.id })
          .where(eq(orders.id, existingOrder.id));
      }

      return createResponseWithCookies({ message: 'Logged in successfully' }, authResponse);
    }

    return NextResponse.json(
      {
        error:
          'Order with this email not found. Please contact support if you believe this is an error.',
      },
      { status: 404 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
