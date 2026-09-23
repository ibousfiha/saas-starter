import { t } from "@lingui/core/macro";
import { ORPCError } from "@orpc/client";
import { AuthError } from "@/lib/auth-client";

// Server messages are plain English; users see translated copy chosen by error code.

// Better Auth error codes users can hit; see BASE_ERROR_CODES and the plugins' *_ERROR_CODES.
function getAuthErrorMessage(error: AuthError) {
	switch (error.code) {
		case "INVALID_EMAIL_OR_PASSWORD":
			return t`Invalid email or password.`;
		case "USER_NOT_FOUND":
		case "USER_EMAIL_NOT_FOUND":
		case "ACCOUNT_NOT_FOUND":
		case "CREDENTIAL_ACCOUNT_NOT_FOUND":
			return t`We couldn't find an account with these details.`;
		case "INVALID_EMAIL":
			return t`Enter a valid email address.`;
		case "EMAIL_NOT_VERIFIED":
			return t`Please verify your email address. We sent you a new link.`;
		case "EMAIL_ALREADY_VERIFIED":
			return t`Your email address is already verified.`;
		case "USER_ALREADY_EXISTS":
		case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
			return t`An account with this email already exists.`;
		case "INVALID_PASSWORD":
			return t`Your password is incorrect.`;
		case "PASSWORD_TOO_SHORT":
			return t`Your password is too short.`;
		case "PASSWORD_TOO_LONG":
			return t`Your password is too long.`;
		case "INVALID_TOKEN":
		case "TOKEN_EXPIRED":
			return t`This link is invalid or has expired.`;
		case "SESSION_EXPIRED":
		case "INVALID_SESSION_TOKEN":
			return t`Your session has expired. Sign in again.`;
		case "SESSION_NOT_FRESH":
			return t`For your security, sign in again to continue.`;
		case "INVALID_CODE":
		case "INVALID_BACKUP_CODE":
			return t`That code is not valid. Try again.`;
		case "INVALID_TWO_FACTOR_COOKIE":
			return t`Your verification session expired. Sign in again.`;
		case "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE":
			return t`Too many attempts. Please wait a moment and try again.`;
		case "USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION":
			return t`This person has already been invited.`;
		case "USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION":
			return t`This person is already a member.`;
		case "ORGANIZATION_ALREADY_EXISTS":
		case "ORGANIZATION_SLUG_ALREADY_TAKEN":
			return t`This URL is already taken.`;
		case "ORGANIZATION_NOT_FOUND":
		case "MEMBER_NOT_FOUND":
			return t`This item no longer exists.`;
		case "NO_ACTIVE_ORGANIZATION":
			return t`Select an organization first.`;
		case "YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER":
		case "YOU_CANNOT_LEAVE_THE_ORGANIZATION_AS_THE_ONLY_OWNER":
			return t`Transfer ownership before leaving this organization.`;
		case "YOU_ARE_NOT_THE_RECIPIENT_OF_THE_INVITATION":
			return t`This invitation was sent to a different email address.`;
		case "EMAIL_VERIFICATION_REQUIRED_BEFORE_ACCEPTING_OR_REJECTING_INVITATION":
			return t`Verify your email address before responding to this invitation.`;
		case "INVITATION_NOT_FOUND":
		case "FAILED_TO_RETRIEVE_INVITATION":
		case "INVITER_IS_NO_LONGER_A_MEMBER_OF_THE_ORGANIZATION":
			return t`This invitation is invalid or has expired.`;
		case "YOU_HAVE_REACHED_THE_MAXIMUM_NUMBER_OF_ORGANIZATIONS":
		case "ORGANIZATION_MEMBERSHIP_LIMIT_REACHED":
		case "INVITATION_LIMIT_REACHED":
			return t`You have reached the limit for this plan.`;
		case "YOU_ARE_NOT_A_MEMBER_OF_THIS_ORGANIZATION":
		case "USER_IS_NOT_A_MEMBER_OF_THE_ORGANIZATION":
			return t`You don't have permission to do this.`;
		default:
			if (error.code?.startsWith("YOU_ARE_NOT_ALLOWED_TO")) {
				return t`You don't have permission to do this.`;
			}
			// Never show the server's English message in a translated UI.
			return error.status === 429
				? t`Too many attempts. Please wait a moment and try again.`
				: t`Something went wrong. Please try again.`;
	}
}

function getApiErrorMessage(error: ORPCError<string, unknown>) {
	switch (error.code) {
		case "UNAUTHORIZED":
			return t`Your session has expired. Sign in again.`;
		case "FORBIDDEN":
			return t`You don't have permission to do this.`;
		case "NOT_FOUND":
			return t`This item no longer exists.`;
		case "TOO_MANY_REQUESTS":
			return t`Too many attempts. Please wait a moment and try again.`;
		default:
			return t`Something went wrong. Please try again.`;
	}
}

export function getErrorMessage(error: unknown) {
	if (error instanceof AuthError) {
		return getAuthErrorMessage(error);
	}
	if (error instanceof ORPCError) {
		return getApiErrorMessage(error);
	}
	return t`Something went wrong. Please try again.`;
}
