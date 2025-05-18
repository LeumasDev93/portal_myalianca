import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { setCookie } from "nookies";

const nextAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {},
      async authorize() {
        try {
          const credentials = Buffer.from(
            "ALIANCA_WEBSITE:TQzQzxvlKSZCzTAVjc2iP6CX"
          ).toString("base64");

          const response = await fetch(
            "https://aliancacvtest.rtcom.pt/anywhere/oauth/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${credentials}`,
              },
              body: new URLSearchParams({
                grant_type: "client_credentials",
                scope: "read write",
              }),
            }
          );

          const data = await response.json();

          if (!response.ok || !data.access_token) {
            throw new Error(data.error || "Falha na autenticação.");
          }

          const token = data.access_token;
          console.log("Token recebido:", token);

          // Armazenar o token no cookie
          setCookie(undefined, "nextauth.token", token, {
            maxAge: 60 * 60 * 1, // 1 hora
            path: "/",
          });

          return {
            id: "oauth-user",
            token: token,
          };
        } catch (error) {
          console.error("Erro no fluxo de autorização:", error);
          throw new Error("Falha na autenticação.");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.tokenExpiry = Math.floor(Date.now() / 1000) + 3600; // Expiração do token em 1 hora
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {};
        session.user.accessToken = token.accessToken as string;
        session.user.tokenExpiry = token.tokenExpiry as number;
      }
      return session;
    },
  },
};


const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
