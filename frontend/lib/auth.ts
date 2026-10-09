import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import prisma from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: async (request) => {
    const origins = ["http://localhost:3000", "http://127.0.0.1:3000"];
    if (process.env.NEXT_PUBLIC_APP_URL) origins.push(process.env.NEXT_PUBLIC_APP_URL);
    if (process.env.BETTER_AUTH_URL) origins.push(process.env.BETTER_AUTH_URL);
    if (request) {
      const host = request.headers.get("host");
      const origin = request.headers.get("origin");
      if (host && origin) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host === host) {
            origins.push(origin);
          }
        } catch {
          // ignore invalid origin
        }
      }
    }
    return origins;
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  user: {
    fields: {
      name: "displayName",
      image: "avatarUrl",
      emailVerified: "emailVerified",
    },
  },
});
