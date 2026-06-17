import GithubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";

export async function getSession() {
  return getServerSession(authOptions);
}

export const authOptions: NextAuthOptions = {
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "",
      from: process.env.EMAIL_FROM || "noreply@microbiomeos.app",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
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
