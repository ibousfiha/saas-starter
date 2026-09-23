import { Plural, Trans } from "@lingui/react/macro";
import { hasPermission } from "@saas-starter/auth/permissions";
import { Button } from "@saas-starter/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/features/auth/queries";
import { InvitationsTable } from "@/features/organization/components/invitations-table";
import { InviteMemberDialog } from "@/features/organization/components/invite-member-dialog";
import { MembersTable } from "@/features/organization/components/members-table";
import {
	organizationQueries,
	useLeaveOrganization,
} from "@/features/organization/queries";
import { hasRole } from "@/features/organization/roles";

function LeaveOrganizationCard({ organizationId }: { organizationId: string }) {
	const leave = useLeaveOrganization();

	return (
		<Card className="border-destructive/30">
			<CardHeader className="sm:grid-cols-[1fr_auto] sm:items-center">
				<div className="grid gap-2">
					<CardTitle>
						<Trans>Leave organization</Trans>
					</CardTitle>
					<CardDescription>
						<Trans>
							You will lose access to its projects until someone invites you
							again.
						</Trans>
					</CardDescription>
				</div>
				<ConfirmDialog
					confirmLabel={<Trans>Leave</Trans>}
					description={
						<Trans>
							You will lose access to this organization and its projects right
							away.
						</Trans>
					}
					onConfirm={() => leave.mutateAsync(organizationId)}
					title={<Trans>Leave this organization?</Trans>}
				>
					<Button className="w-full sm:w-auto" variant="outline">
						<LogOut />
						<Trans>Leave</Trans>
					</Button>
				</ConfirmDialog>
			</CardHeader>
		</Card>
	);
}

export function MembersPage() {
	const { user } = useSession();
	const { data: members } = useSuspenseQuery(organizationQueries.members());
	const actor = members.find((member) => member.userId === user.id);

	if (!actor) {
		throw new Error("You are not a member of this organization.");
	}

	const canInvite = hasPermission(actor.role, {
		invitation: ["create"],
	});
	const count = members.length;

	return (
		<>
			<PageHeader
				actions={canInvite && <InviteMemberDialog actorRole={actor.role} />}
				description={<Trans>Manage who has access to this organization.</Trans>}
				title={<Trans>Members</Trans>}
			/>
			<Card className="pb-0">
				<CardHeader>
					<CardTitle>
						<Trans>Team</Trans>
					</CardTitle>
					<CardDescription>
						<Plural one="# member" other="# members" value={count} />
					</CardDescription>
				</CardHeader>
				<CardContent className="border-t px-0">
					<MembersTable actor={actor} members={members} />
				</CardContent>
			</Card>
			{canInvite && (
				<Card className="pb-0">
					<CardHeader>
						<CardTitle>
							<Trans>Pending invitations</Trans>
						</CardTitle>
						<CardDescription>
							<Trans>
								People who have been invited but have not joined yet.
							</Trans>
						</CardDescription>
					</CardHeader>
					<CardContent className="border-t px-0">
						<InvitationsTable
							canCancel={hasPermission(actor.role, {
								invitation: ["cancel"],
							})}
						/>
					</CardContent>
				</Card>
			)}
			{!hasRole(actor.role, "owner") && (
				<LeaveOrganizationCard organizationId={actor.organizationId} />
			)}
		</>
	);
}
