import { ac, roles } from "@saas-starter/auth/permissions";
import {
	adminClient,
	organizationClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		organizationClient({
			ac,
			roles,
			schema: {
				invitation: {
					additionalFields: {
						message: { required: false, type: "string" },
					},
				},
			},
		}),
		twoFactorClient(),
		adminClient(),
	],
});

export type Session = typeof authClient.$Infer.Session;

interface AuthErrorBody {
	code?: string;
	message?: string;
	status: number;
	statusText: string;
}

export class AuthError extends Error {
	readonly code: string | undefined;
	readonly status: number;

	constructor(body: AuthErrorBody) {
		super(body.message ?? body.statusText);
		this.name = "AuthError";
		this.code = body.code;
		this.status = body.status;
	}
}

type AuthResult<T> =
	| { data: T; error: null }
	| { data: null; error: AuthErrorBody };

export async function unwrap<T>(request: Promise<AuthResult<T>>): Promise<T> {
	const { data, error } = await request;
	if (error) {
		throw new AuthError(error);
	}
	return data as T;
}
