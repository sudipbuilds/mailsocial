import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { orders, users } from '@/db/schema';
import { createAuth } from '@/lib/auth/config';
import { generateSecretKey } from '@/lib/generate-key';
import { loginFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

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

export const POST = withRateLimit(
  withApiContext(async (request, ctx) => {
    const reqBody = await request.json();
    const validated = loginFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return ctx.error.badRequest(validated.error.issues[0].message);
    }

    const { email, otp } = validated.data;
    const auth = await createAuth();
    const authenticated = await auth.api.getSession({
      headers: request.headers,
    });
    if (authenticated?.user || authenticated?.session) {
      return ctx.error.badRequest('Already logged in');
    }

    const db = await getD1Database();

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      ctx.log.info({ userId: existingUser.id }, 'Existing user sign-in');
      const authResponse = await auth.api.signInEmailOTP({
        headers: request.headers,
        body: { email, otp },
        asResponse: true,
      });

      return createResponseWithCookies(
        { message: 'Logged in successfully', username: existingUser.username },
        authResponse
      );
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
      ctx.log.info({ orderId: existingOrder.id }, 'New user sign-in from order');
      const secretKey = generateSecretKey(existingOrder.customerUsername);

      const authResponse = await auth.api.signInEmailOTP({
        headers: request.headers,
        body: {
          email,
          otp,
          name: existingOrder.customerName,
          username: existingOrder.customerUsername,
          secretKey,
        },
        asResponse: true,
      });

      const authData = (await authResponse.json()) as { user?: { id: string } };
      if (authData.user) {
        await db
          .update(orders)
          .set({ userId: authData.user.id })
          .where(eq(orders.id, existingOrder.id));
        ctx.log.info(
          { userId: authData.user.id, orderId: existingOrder.id },
          'Order linked to user'
        );
      }

      return createResponseWithCookies(
        { message: 'Logged in successfully', username: existingOrder.customerUsername },
        authResponse
      );
    }

    ctx.log.warn({ email }, 'Sign-in attempted but no user or order found');
    return ctx.error.notFound(
      'Order with this email not found. Please contact support if you believe this is an error.'
    );
  }),
  {
    routeId: 'POST:/api/signin',
  }
);
