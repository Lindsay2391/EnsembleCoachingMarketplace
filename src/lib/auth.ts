import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            coachProfile: { select: { id: true } },
            ensembleProfiles: { select: { id: true } },
          },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          userType: user.userType,
          coachProfileId: user.coachProfile?.id || null,
          ensembleProfileIds: user.ensembleProfiles.map((ep) => ep.id),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.userType = (user as { userType: string }).userType;
        token.id = user.id;
        token.coachProfileId = (user as { coachProfileId: string | null }).coachProfileId;
        token.ensembleProfileIds = (user as { ensembleProfileIds: string[] }).ensembleProfileIds;
      }
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            coachProfile: { select: { id: true } },
            ensembleProfiles: { select: { id: true } },
          },
        });
        if (dbUser) {
          token.coachProfileId = dbUser.coachProfile?.id || null;
          token.ensembleProfileIds = dbUser.ensembleProfiles.map((ep) => ep.id);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as Record<string, unknown>).id = token.id;
        (session.user as Record<string, unknown>).userType = token.userType;
        (session.user as Record<string, unknown>).coachProfileId = token.coachProfileId || null;
        (session.user as Record<string, unknown>).ensembleProfileIds = token.ensembleProfileIds || [];
      }
      return session;
    },
  },
};
