import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { redirectIfSignedIn } from "@/features/auth/guards";

export const Route = createFileRoute("/_auth")({
	beforeLoad: redirectIfSignedIn,
	component: () => (
		<AuthLayout>
			<Outlet />
		</AuthLayout>
	),
});
