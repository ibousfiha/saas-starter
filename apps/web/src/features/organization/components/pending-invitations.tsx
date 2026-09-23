import { Trans } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { organizationQueries } from "@/features/organization/queries";

export function PendingInvitations() {
	const { data: invitations = [] } = useQuery(
		organizationQueries.userInvitations()
	);

	if (invitations.length === 0) {
		return null;
	}

	return (
		<section className="mb-8 grid gap-3">
			<h2 className="font-medium text-sm">
				<Trans>You have been invited to join</Trans>
			</h2>
			<ul className="grid gap-2">
				{invitations.map(({ id, organizationName }) => (
					<li
						className="flex items-center gap-3 rounded-lg border p-3"
						key={id}
					>
						<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary font-semibold text-primary-foreground text-sm">
							{organizationName.slice(0, 1).toUpperCase()}
						</span>
						<span className="flex-1 truncate font-medium text-sm">
							{organizationName}
						</span>
						<Button asChild size="sm" variant="outline">
							<Link search={{ id }} to="/accept-invitation">
								<Trans>View</Trans>
							</Link>
						</Button>
					</li>
				))}
			</ul>
		</section>
	);
}
