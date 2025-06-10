import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
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
          console.log("❌ Credenciais vazias")
          return null
        }

        try {
          console.log("🔍 Buscando usuário no banco Neon:", credentials.email)
          console.log("🔧 DATABASE_URL sendo usada:", process.env.DATABASE_URL?.substring(0, 30) + '...')
          
          // Force reconnect to avoid cached connections
          await db.$connect()
          
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })

          if (!user || !user.password) {
            console.log("❌ Usuário não encontrado ou sem senha")
            return null
          }

          console.log("🔑 Verificando senha...")
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            console.log("❌ Senha inválida")
            return null
          }

          console.log("✅ Login bem-sucedido:", user.email)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            agencyId: user.agencyId,
          }
        } catch (error) {
          console.error("❌ Erro na autenticação:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.agencyId = user.agencyId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as Role
        session.user.agencyId = token.agencyId as string | null
      }
      return session
    },
    async signIn() {
      return true
    },
  },
})

declare module "next-auth" {
  interface User {
    role: Role
    agencyId: string | null
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      agencyId: string | null
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: Role
    agencyId: string | null
  }
}
