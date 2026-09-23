import type { RouterClient } from "@orpc/server";
import { invitationRouter } from "./invitation";
import { projectRouter } from "./project";

export const appRouter = {
	invitation: invitationRouter,
	project: projectRouter,
};

export type AppRouterClient = RouterClient<typeof appRouter>;
