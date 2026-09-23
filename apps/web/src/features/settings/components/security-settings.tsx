import { ChangePasswordCard } from "@/features/settings/components/change-password-card";
import { SessionsCard } from "@/features/settings/components/sessions-card";
import { TwoFactorCard } from "@/features/settings/components/two-factor-card";

export function SecuritySettings() {
	return (
		<div className="grid grid-cols-1 gap-6">
			<ChangePasswordCard />
			<TwoFactorCard />
			<SessionsCard />
		</div>
	);
}
