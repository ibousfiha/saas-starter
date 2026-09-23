import { useLingui } from "@lingui/react/macro";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@saas-starter/ui/components/breadcrumb";
import { Link, useMatches } from "@tanstack/react-router";
import { Fragment } from "react";

export function AppBreadcrumb() {
	const { t } = useLingui();
	const crumbs = useMatches({
		select: (matches) =>
			matches.flatMap((match) =>
				match.staticData.title
					? [
							{
								id: match.id,
								pathname: match.pathname,
								title: match.staticData.title,
							},
						]
					: []
			),
	});

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{crumbs.map((crumb, index) => (
					<Fragment key={crumb.id}>
						{index > 0 && <BreadcrumbSeparator />}
						<BreadcrumbItem>
							{index === crumbs.length - 1 ? (
								<BreadcrumbPage>{t(crumb.title)}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link to={crumb.pathname}>{t(crumb.title)}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
