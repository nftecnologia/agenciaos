import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Role } from "@prisma/client"

// Usuários mock para desenvolvimento (quando não há banco)
const mockUsers = [
  {
    id: "1",
    email: "admin@agenciaos.com",
    password: "123456", // Em produção seria hash
    name: "Admin AgênciaOS",
    role: "ADMIN" as Role,
    agencyId: "agency-1"
  },
  {
    id: "2", 
    email: "user@agenciaos.com",
    password: "123456",
    name: "Usuário Teste",
    role: "USER" as Role,
    agencyId: "agency-1"
  }
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Remover PrismaAdapter temporariamente para desenvolvimento
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
          return null
        }

        try {
          // Tentar usar banco de dados primeiro
          const { db } = await import("@/lib/db")
          
          const user = await db.user.findUnique({
            where: {
              email: credentials.email as string,
            },
          })

          if (!user || !user.password) {
            return null
          }

          const bcrypt = await import("bcryptjs")
          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            agencyId: user.agencyId,
          }
        } catch (error) {
          // Se falhar (banco indisponível), usar sistema mock
          console.log("🔄 Banco indisponível, usando autenticação mock para desenvolvimento")
          
          const mockUser = mockUsers.find(
            u => u.email === credentials.email && u.password === credentials.password
          )

          if (!mockUser) {
            return null
          }

          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
            image: null,
            role: mockUser.role,
            agencyId: mockUser.agencyId,
          }
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
