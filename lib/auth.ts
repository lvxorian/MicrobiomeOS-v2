import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.EMAIL_SERVER
      ? [EmailProvider({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM || "noreply@microbiomeos.app",
        })]
      : []),
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [GithubProvider({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
        })]
      : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.sub || "";
      }
      return session;
    },
  },
};
