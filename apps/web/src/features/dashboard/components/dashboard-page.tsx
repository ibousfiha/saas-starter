import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@saas-starter/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@saas-starter/ui/components/card";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	ArrowRight,
	FolderKanban,
	FolderPlus,
	type LucideIcon,
	MailPlus,
	Plus,
	UserPlus,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { useSession } from "@/features/auth/queries";
import { organizationQueries } from "@/features/organization/queries";
import { projectQueries } from "@/features/projects/queries";

const RECENT_PROJECTS = 5;

interface StatCardProps {
	icon: LucideIcon;
	label: ReactNode;
	to: "/members" | "/projects";
	value: number;
}

function StatCard({ icon: Icon, label, to, value }: StatCardProps) {
	return (
		<Link
			className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
			to={to}
		>
			<Card className="gap-2 transition-colors group-hover:bg-accent/50">
				<CardHeader>
					<CardDescription>{label}</CardDescription>
					<CardAction>
						<Icon className="size-4 text-muted-foreground" />
					</CardAction>
				</CardHeader>
				<CardContent>
					<p className="font-semibold text-3xl tabular-nums tracking-tight">
						{value}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}

function RecentProjects() {
	const { i18n } = useLingui();
	const { data: projects } = useSuspenseQuery(projectQueries.list());
	const recent = projects.slice(0, RECENT_PROJECTS);

	return (
		<Card className="lg:col-span-2">
			<CardHeader>
				<CardTitle>
					<Trans>Recent projects</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>The latest projects in this organization.</Trans>
				</CardDescription>
				{recent.length > 0 && (
					<CardAction>
						<Button asChild size="sm" variant="ghost">
							<Link to="/projects">
								<Trans>View all</Trans>
								<ArrowRight />
							</Link>
						</Button>
					</CardAction>
				)}
			</CardHeader>
			<CardContent>
				{recent.length > 0 ? (
					<ul className="-my-2 divide-y">
						{recent.map((project) => (
							<li
								className="flex items-center justify-between gap-4 py-3"
								key={project.id}
							>
								<div className="min-w-0">
									<p className="truncate font-medium text-sm">{project.name}</p>
									{project.description && (
										<p className="truncate text-muted-foreground text-sm">
											{project.description}
										</p>
									)}
								</div>
								<time
									className="shrink-0 text-muted-foreground text-xs"
									dateTime={project.createdAt.toISOString()}
								>
									{i18n.date(project.createdAt, { dateStyle: "medium" })}
								</time>
							</li>
						))}
					</ul>
				) : (
					<EmptyState
						action={
							<Button asChild size="sm">
								<Link search={{ new: true }} to="/projects">
									<Plus />
									<Trans>New project</Trans>
								</Link>
							</Button>
						}
						description={<Trans>Projects you create will show up here.</Trans>}
						icon={FolderKanban}
						title={<Trans>No projects yet</Trans>}
					/>
				)}
			</CardContent>
		</Card>
	);
}

function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<Trans>Quick actions</Trans>
				</CardTitle>
				<CardDescription>
					<Trans>Jump straight into common tasks.</Trans>
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2">
				<Button asChild className="justify-start" variant="outline">
					<Link search={{ new: true }} to="/projects">
						<FolderPlus />
						<Trans>New project</Trans>
					</Link>
				</Button>
				<Button asChild className="justify-start" variant="outline">
					<Link to="/members">
						<UserPlus />
						<Trans>Invite member</Trans>
					</Link>
				</Button>
			</CardContent>
		</Card>
	);
}

export function DashboardPage() {
	const { user } = useSession();
	const { data: projects } = useSuspenseQuery(projectQueries.list());
	const { data: organization } = useSuspenseQuery(organizationQueries.active());
	const pendingInvitations =
		organization?.invitations.filter(
			(invitation) => invitation.status === "pending"
		).length ?? 0;
	const firstName = user.name.split(" ")[0] || user.name;

	return (
		<>
			<PageHeader
				description={
					<Trans>Here is what is happening in {organization?.name}.</Trans>
				}
				title={<Trans>Welcome back, {firstName}</Trans>}
			/>
			<div className="grid gap-4 sm:grid-cols-3">
				<StatCard
					icon={FolderKanban}
					label={<Trans>Projects</Trans>}
					to="/projects"
					value={projects.length}
				/>
				<StatCard
					icon={Users}
					label={<Trans>Members</Trans>}
					to="/members"
					value={organization?.members.length ?? 0}
				/>
				<StatCard
					icon={MailPlus}
					label={<Trans>Pending invitations</Trans>}
					to="/members"
					value={pendingInvitations}
				/>
			</div>
			<div className="grid items-start gap-4 lg:grid-cols-3">
				<RecentProjects />
				<QuickActions />
			</div>
		</>
	);
}
