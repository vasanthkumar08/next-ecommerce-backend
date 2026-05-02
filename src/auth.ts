import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { AuthUser, Role } from "@/types/rbac";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const demoUsers: Array<AuthUser & { password: string }> = [
  {
    id: "usr_admin",
    name: "Admin Owner",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  },
  {
    id: "usr_manager",
    name: "Store Manager",
    email: "manager@example.com",
    password: "password123",
    role: "manager",
  },
  {
    id: "usr_user",
    name: "Customer User",
    email: "user@example.com",
    password: "password123",
    role: "user",
  },
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV === "production"
      ? undefined
      : "dev-only-rbac-dashboard-secret-change-me"),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          return null;
        }

        const user = demoUsers.find(
          (item) =>
            item.email === parsed.data.email &&
            item.password === parsed.data.password
        );

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as Role;
      }

      return session;
    },
  },
});
