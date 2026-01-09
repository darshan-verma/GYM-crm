import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { UserRole, Permission } from "@prisma/client";
import prisma from "./db/prisma";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			role: UserRole;
			permissions: Permission[];
		} & DefaultSession["user"];
	}

	interface User {
		role: UserRole;
		permissions: Permission[];
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const user = await prisma.user.findUnique({
					where: { email: credentials.email as string },
					select: {
						id: true,
						email: true,
						name: true,
						password: true,
						role: true,
						permissions: true,
						active: true,
						avatar: true,
					},
				});

				if (!user || !user.active) {
					return null;
				}

				const isPasswordValid = await compare(
					credentials.password as string,
					user.password
				);

				if (!isPasswordValid) {
					return null;
				}

				// Update last login
				await prisma.user.update({
					where: { id: user.id },
					data: { lastLogin: new Date() },
				});

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
					permissions: user.permissions,
					image: user.avatar,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
				token.permissions = user.permissions;
				token.name = user.name;
				token.email = user.email;
				token.image = user.image;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as UserRole;
				session.user.permissions = token.permissions as Permission[];
				session.user.name = token.name as string;
				session.user.email = token.email as string;
				session.user.image = token.image as string;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
});
