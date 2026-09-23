import type { AppRouterClient } from "@saas-starter/api/routers/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/lib/orpc";

export type Project = Awaited<ReturnType<AppRouterClient["project"]["get"]>>;

export const projectQueries = {
	all: () => orpc.project.key(),
	list: () => orpc.project.list.queryOptions(),
};

function useInvalidateProjects() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: projectQueries.all() });
}

export function useCreateProject() {
	const onSuccess = useInvalidateProjects();
	return useMutation(orpc.project.create.mutationOptions({ onSuccess }));
}

export function useUpdateProject() {
	const onSuccess = useInvalidateProjects();
	return useMutation(orpc.project.update.mutationOptions({ onSuccess }));
}

export function useDeleteProject() {
	const onSuccess = useInvalidateProjects();
	return useMutation(orpc.project.delete.mutationOptions({ onSuccess }));
}
