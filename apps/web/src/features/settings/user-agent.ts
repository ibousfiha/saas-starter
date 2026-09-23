const BROWSERS: [RegExp, string][] = [
	[/Edg(e|A|iOS)?\//, "Edge"],
	[/OPR\/|Opera/, "Opera"],
	[/Firefox\/|FxiOS/, "Firefox"],
	[/Chrome\/|CriOS/, "Chrome"],
	[/Safari\//, "Safari"],
];

const SYSTEMS: [RegExp, string][] = [
	[/Windows/, "Windows"],
	[/iPhone|iPad|iPod/, "iOS"],
	[/Android/, "Android"],
	[/CrOS/, "ChromeOS"],
	[/Mac OS X|Macintosh/, "macOS"],
	[/Linux/, "Linux"],
];

const MOBILE = /Mobi|iPhone|iPod|Android/;

function match(value: string, patterns: [RegExp, string][]) {
	return patterns.find(([pattern]) => pattern.test(value))?.[1];
}

export function parseUserAgent(userAgent: string | null | undefined) {
	const value = userAgent ?? "";
	return {
		browser: match(value, BROWSERS),
		isMobile: MOBILE.test(value),
		os: match(value, SYSTEMS),
	};
}
