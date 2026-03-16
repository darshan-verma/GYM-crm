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
			gymProfileId?: string | null;
		} & DefaultSession["user"];
	}

	interface User {
		role: UserRole;
		permissions: Permission[];
		gymProfileId?: string | null;
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	trustHost: true,
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				identifier: { label: "Email or Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.identifier || !credentials?.password) {
					return null;
				}

				const identifier = credentials.identifier as string;

				const user =
					(await prisma.user.findUnique({
						where: { email: identifier.toLowerCase() },
					})) ??
					(await prisma.user.findUnique({
						where: { username: identifier },
					}));

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
					permissions: user.permissions ?? [],
					image: user.avatar,
					gymProfileId: user.gymProfileId ?? null,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				type AuthUser = {
					id: string;
					role: UserRole;
					permissions: Permission[];
					name?: string | null;
					email?: string | null;
					image?: string | null;
					gymProfileId?: string | null;
				};

				const authUser = user as AuthUser;

				token.id = authUser.id;
				token.role = authUser.role;
				token.permissions = authUser.permissions;
				token.name = authUser.name;
				token.email = authUser.email;
				token.image = authUser.image;
				token.gymProfileId = authUser.gymProfileId ?? null;
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
				session.user.gymProfileId = (token.gymProfileId as string | null) ?? null;
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
