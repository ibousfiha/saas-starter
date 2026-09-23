const WHITESPACE = /\s+/;

export function getInitials(name: string) {
	const parts = name.trim().split(WHITESPACE).filter(Boolean);
	const letters =
		parts.length > 1
			? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`
			: (parts[0]?.slice(0, 2) ?? "");
	return letters.toUpperCase() || "?";
}
