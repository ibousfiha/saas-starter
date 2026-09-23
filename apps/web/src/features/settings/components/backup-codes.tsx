import { Trans, useLingui } from "@lingui/react/macro";
import { siteConfig } from "@saas-starter/config";
import { Button } from "@saas-starter/ui/components/button";
import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";

export function BackupCodes({ codes }: { codes: string[] }) {
	const { t } = useLingui();
	const [copied, setCopied] = useState(false);
	const text = codes.join("\n");

	async function copy() {
		await navigator.clipboard.writeText(text);
		setCopied(true);
	}

	function download() {
		const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `${siteConfig.name.toLowerCase()}-backup-codes.txt`;
		link.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="grid gap-3">
			<ul
				aria-label={t`Backup codes`}
				className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border bg-muted/50 p-4 font-mono text-sm"
			>
				{codes.map((code) => (
					<li className="text-center" key={code}>
						{code}
					</li>
				))}
			</ul>
			<div className="grid grid-cols-2 gap-2">
				<Button onClick={() => copy().catch(() => undefined)} variant="outline">
					{copied ? <Check /> : <Copy />}
					{copied ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
				</Button>
				<Button onClick={download} variant="outline">
					<Download />
					<Trans>Download</Trans>
				</Button>
			</div>
		</div>
	);
}
