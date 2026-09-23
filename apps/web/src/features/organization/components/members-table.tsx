import { Trans, useLingui } from "@lingui/react/macro";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@saas-starter/ui/components/avatar";
import { Badge } from "@saas-starter/ui/components/badge";
import { Button } from "@saas-starter/ui/components/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@saas-starter/ui/components/table";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/components/app-shell/user-initials";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { RoleBadge } from "@/features/organization/components/role-badge";
import { RoleSelect } from "@/features/organization/components/role-select";
import {
	type OrganizationMember,
	useRemoveMember,
	useUpdateMemberRole,
} from "@/features/organization/queries";
import {
	getAssignableRoles,
	getMemberActions,
} from "@/features/organization/roles";

export const cardTableClassName =
	"[&_td:first-child]:pl-6 [&_td:last-child]:pr-6 [&_th:first-child]:pl-6 [&_th:last-child]:pr-6";

interface MemberRowProps {
	actor: OrganizationMember;
	member: OrganizationMember;
}

function MemberRow({ actor, member }: MemberRowProps) {
	const { i18n, t } = useLingui();
	const updateRole = useUpdateMemberRole();
	const removeMember = useRemoveMember();
	const { canChangeRole, canRemove } = getMemberActions(actor, member);
	const { name, email, image } = member.user;

	return (
		<TableRow>
			<TableCell>
				<div className="flex min-w-0 items-center gap-3">
					<Avatar className="size-8">
						{image && <AvatarImage alt="" src={image} />}
						<AvatarFallback>{getInitials(name)}</AvatarFallback>
					</Avatar>
					<div className="grid min-w-0">
						<span className="flex items-center gap-2 truncate font-medium">
							{name}
							{member.id === actor.id && (
								<Badge variant="secondary">
									<Trans>You</Trans>
								</Badge>
							)}
						</span>
						<span className="truncate text-muted-foreground">{email}</span>
					</div>
				</div>
			</TableCell>
			<TableCell>
				{canChangeRole ? (
					<RoleSelect
						aria-label={t`Role for ${name}`}
						className="w-28"
						disabled={updateRole.isPending}
						onValueChange={(role) =>
							updateRole.mutate(
								{ memberId: member.id, role },
								{ onSuccess: () => toast.success(t`Role updated.`) }
							)
						}
						roles={getAssignableRoles(actor.role)}
						size="sm"
						value={member.role}
					/>
				) : (
					<RoleBadge role={member.role} />
				)}
			</TableCell>
			<TableCell className="hidden text-muted-foreground md:table-cell">
				{i18n.date(member.createdAt, { dateStyle: "medium" })}
			</TableCell>
			<TableCell className="w-12 text-right">
				{canRemove && (
					<ConfirmDialog
						confirmLabel={<Trans>Remove</Trans>}
						description={
							<Trans>
								{name} will lose access to this organization and its projects
								right away.
							</Trans>
						}
						onConfirm={async () => {
							await removeMember.mutateAsync(member.id);
							toast.success(t`${name} was removed.`);
						}}
						title={<Trans>Remove {name}?</Trans>}
					>
						<Button aria-label={t`Remove ${name}`} size="icon" variant="ghost">
							<UserMinus />
						</Button>
					</ConfirmDialog>
				)}
			</TableCell>
		</TableRow>
	);
}

interface MembersTableProps {
	actor: OrganizationMember;
	members: OrganizationMember[];
}

export function MembersTable({ actor, members }: MembersTableProps) {
	return (
		<Table className={cardTableClassName}>
			<TableHeader>
				<TableRow>
					<TableHead>
						<Trans>Member</Trans>
					</TableHead>
					<TableHead>
						<Trans>Role</Trans>
					</TableHead>
					<TableHead className="hidden md:table-cell">
						<Trans>Joined</Trans>
					</TableHead>
					<TableHead>
						<span className="sr-only">
							<Trans>Actions</Trans>
						</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{members.map((member) => (
					<MemberRow actor={actor} key={member.id} member={member} />
				))}
			</TableBody>
		</Table>
	);
}
