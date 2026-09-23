import { hasPermission } from "@saas-starter/auth/permissions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/queries";
import { DeleteOrganizationCard } from "@/features/organization/components/delete-organization-card";
import { OrganizationGeneralCard } from "@/features/organization/components/organization-general-card";
import { organizationQueries } from "@/features/organization/queries";

export function OrganizationSettings() {
	const { user } = useSession();
	const { data: organization } = useSuspenseQuery(organizationQueries.active());
	if (!organization) {
		throw new Error("No active organization.");
	}
	const role =
		organization.members.find((member) => member.userId === user.id)?.role ??
		"";

	return (
		<div className="grid gap-6">
			<OrganizationGeneralCard
				canUpdate={hasPermission(role, {
					organization: ["update"],
				})}
				key={organization.id}
				organization={organization}
			/>
			{hasPermission(role, { organization: ["delete"] }) && (
				<DeleteOrganizationCard organization={organization} />
			)}
		</div>
	);
}
