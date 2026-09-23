import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@saas-starter/ui/components/badge";
import { Button } from "@saas-starter/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { Skeleton } from "@saas-starter/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useSession } from "@/features/auth/queries";
import { formatIpAddress } from "@/features/settings/ip-address";
import { activeSessionsQueryOptions } from "@/features/settings/queries";
import { parseUserAgent } from "@/features/settings/user-agent";
import { authClient, unwrap } from "@/lib/auth-client";

export function SessionsCard() {
	const { i18n, t } = useLingui();
	const { session: current } = useSession();
	const queryClient = useQueryClient();
	const { data: sessions } = useQuery(activeSessionsQueryOptions());

	const onSuccess = () =>
		queryClient.invalidateQueries({
			queryKey: activeSessionsQueryOptions().queryKey,
		});

	const revoke = useMutation({
		mutationFn: (token: string) => unwrap(authClient.revokeSession({ token })),
		onSuccess: async () => {
			await onSuccess();
			toast.success(t`Session revoked.`);
		},
	});

	const revokeOthers = useMutation({
		mutationFn: () => unwrap(authClient.revokeOtherSessions()),
		onSuccess: async () => {
			await onSuccess();
			toast.success(t`Signed out of all other sessions.`);
		},
	});

	const sorted = sessions?.toSorted(
		(a, b) =>
			Number(b.id === current.id) - Number(a.id === current.id) ||
			b.updatedAt.getTime() - a.updatedAt.getTime()
	);
	const hasOthers = sorted?.some((session) => session.id !== current.id);

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Active sessions</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Devices that are signed in to your account.</Trans>
				</CardDescription>
				{hasOthers && (
					<CardAction>
						<ConfirmDialog
							confirmLabel={<Trans>Sign out others</Trans>}
							description={
								<Trans>Every device except this one will be signed out.</Trans>
							}
							onConfirm={() => revokeOthers.mutateAsync()}
							title={<Trans>Sign out of all other sessions?</Trans>}
						>
							<Button size="sm" variant="outline">
								<Trans>Sign out others</Trans>
							</Button>
						</ConfirmDialog>
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				{sorted ? (
					<ul className="-my-3 divide-y">
						{sorted.map((session) => {
							const { browser, isMobile, os } = parseUserAgent(
								session.userAgent
							);
							const Icon = isMobile ? Smartphone : Monitor;
							const isCurrent = session.id === current.id;
							const lastActive = i18n.date(session.updatedAt, {
								dateStyle: "medium",
								timeStyle: "short",
							});
							const device =
								browser && os
									? t`${browser} on ${os}`
									: (browser ?? os ?? t`Unknown device`);

							return (
								<li className="flex items-center gap-3 py-3" key={session.id}>
									<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
										<Icon className="size-4 text-muted-foreground" />
									</span>
									<div className="min-w-0 flex-1">
										<p className="flex flex-wrap items-center gap-2 font-medium text-sm">
											{device}
											{isCurrent && (
												<Badge variant="secondary">
													<Trans>This device</Trans>
												</Badge>
											)}
										</p>
										<p className="truncate text-muted-foreground text-xs">
											{[
												t`Last active ${lastActive}`,
												formatIpAddress(session.ipAddress),
											]
												.filter(Boolean)
												.join(" · ")}
										</p>
									</div>
									{!isCurrent && (
										<Button
											disabled={revoke.isPending}
											onClick={() => revoke.mutate(session.token)}
											size="sm"
											variant="ghost"
										>
											<Trans>Revoke</Trans>
										</Button>
									)}
								</li>
							);
						})}
					</ul>
				) : (
					<div className="grid gap-3">
						<Skeleton className="h-12" />
						<Skeleton className="h-12" />
					</div>
				)}
			</CardContent>
		</Card>
	);
}
