import { useLingui } from "@lingui/react/macro";
import { cn } from "@saas-starter/ui/lib/utils";
import { Loader2Icon } from "lucide-react";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
	const { t } = useLingui();
	return (
		<Loader2Icon
			aria-label={t`Loading`}
			className={cn("size-4 animate-spin", className)}
			role="status"
			{...props}
		/>
	);
}

export { Spinner };
