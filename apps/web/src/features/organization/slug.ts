const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const EDGE_DASHES = /^-+|-+$/g;
const DIACRITICS = /\p{Diacritic}/gu;

export function slugify(value: string) {
	return value
		.normalize("NFKD")
		.replace(DIACRITICS, "")
		.toLowerCase()
		.replace(NON_ALPHANUMERIC, "-")
		.replace(EDGE_DASHES, "")
		.slice(0, 40)
		.replace(EDGE_DASHES, "");
}

export function createOrganizationSlug(
	name: string,
	suffix = crypto.randomUUID().slice(0, 6)
) {
	const base = slugify(name);
	return base ? `${base}-${suffix}` : suffix;
}
