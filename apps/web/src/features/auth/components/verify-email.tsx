import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { Link } from "@tanstack/react-router";
import { CircleAlert, CircleCheck } from "lucide-react";
import { AuthHeader } from "@/features/auth/components/auth-layout";
import { safeRedirect } from "@/lib/redirect";

export function VerifyEmail({
	error,
	redirect,
}: {
	error?: string;
	redirect?: string;
}) {
	if (error) {
		return (
			<div className="grid gap-6 text-center">
				<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
					<CircleAlert className="size-6" />
				</div>
				<AuthHeader
					description={
						<Trans>
							This verification link is invalid or has expired. Sign in to get a
							new one.
						</Trans>
					}
					title={<Trans>Verification failed</Trans>}
				/>
				<Button asChild>
					<Link to="/sign-in">
						<Trans>Go to sign in</Trans>
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-6 text-center">
			<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
				<CircleCheck className="size-6" />
			</div>
			<AuthHeader
				description={
					<Trans>Your email address is confirmed. You are all set.</Trans>
				}
				title={<Trans>Email verified</Trans>}
			/>
			<Button asChild>
				<Link to={safeRedirect(redirect)}>
					<Trans>Continue</Trans>
				</Link>
			</Button>
		</div>
	);
}
