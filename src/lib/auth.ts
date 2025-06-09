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

        // Usar sistema mock para desenvolvimento
        console.log("🔄 Usando autenticação mock para desenvolvimento")
        console.log("📧 Tentando login:", credentials.email)
        
        const mockUser = mockUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (!mockUser) {
          console.log("❌ Usuário mock não encontrado:", credentials.email)
          console.log("✅ Usuários disponíveis:", mockUsers.map(u => u.email))
          return null
        }

        console.log("✅ Login mock bem-sucedido:", mockUser.email)
        return {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          image: null,
          role: mockUser.role,
          agencyId: mockUser.agencyId,
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
