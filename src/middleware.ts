import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except the webhook route
    '/((?!api/webhooks/clerk).*)',

    // Also match your API and TRPC routes except the webhook
    // (optional, depending on your app structure)
    // '/(api|trpc)(?!/webhooks/clerk)(.*)',
  ],
};
