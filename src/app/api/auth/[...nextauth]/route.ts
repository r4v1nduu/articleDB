import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUsersCollection } from "@/lib/database";
import { loginUserSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { Role } from "@/types/user";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        const { email, password } = credentials;
        const validation = loginUserSchema.safeParse({ email, password });

        if (!validation.success) {
          return null;
        }

        const users = await getUsersCollection();
        const user = await users.findOne({ email });

        if (user && bcrypt.compareSync(password, user.password)) {
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
