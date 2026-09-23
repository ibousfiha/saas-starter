import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@saas-starter/ui/components/table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MailPlus, X } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { cardTableClassName } from "@/features/organization/components/members-table";
import { RoleBadge } from "@/features/organization/components/role-badge";
import {
	organizationQueries,
	useCancelInvitation,
} from "@/features/organization/queries";

export function InvitationsTable({ canCancel }: { canCancel: boolean }) {
	const { i18n, t } = useLingui();
	const { data: invitations } = useSuspenseQuery(
		organizationQueries.invitations()
	);
	const cancelInvitation = useCancelInvitation();

	if (invitations.length === 0) {
		return (
			<div className="p-6">
				<EmptyState
					description={
						<Trans>Invite teammates by email to collaborate with them.</Trans>
					}
					icon={MailPlus}
					title={<Trans>No pending invitations</Trans>}
				/>
			</div>
		);
	}

	return (
		<Table className={cardTableClassName}>
			<TableHeader>
				<TableRow>
					<TableHead>
						<Trans>Email</Trans>
					</TableHead>
					<TableHead>
						<Trans>Role</Trans>
					</TableHead>
					<TableHead className="hidden md:table-cell">
						<Trans>Expires</Trans>
					</TableHead>
					<TableHead>
						<span className="sr-only">
							<Trans>Actions</Trans>
						</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invitations.map(({ email, expiresAt, id, role }) => (
					<TableRow key={id}>
						<TableCell className="max-w-48 truncate font-medium sm:max-w-none">
							{email}
						</TableCell>
						<TableCell>
							<RoleBadge role={role} />
						</TableCell>
						<TableCell className="hidden text-muted-foreground md:table-cell">
							{i18n.date(expiresAt, {
								dateStyle: "medium",
								timeStyle: "short",
							})}
						</TableCell>
						<TableCell className="w-12 text-right">
							{canCancel && (
								<Button
									aria-label={t`Cancel invitation for ${email}`}
									disabled={cancelInvitation.isPending}
									onClick={() =>
										cancelInvitation.mutate(id, {
											onSuccess: () => toast.success(t`Invitation canceled.`),
										})
									}
									size="icon"
									variant="ghost"
								>
									<X />
								</Button>
							)}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
