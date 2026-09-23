#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const I18N_DIR = resolve(import.meta.dirname, "../packages/i18n");
const LOCALES_DIR = resolve(I18N_DIR, "src/locales");
const LOCALES = ["en", "de", "fr"] as const;
const SOURCE_LOCALE = "en";
const TARGET_LOCALES = LOCALES.filter((l) => l !== SOURCE_LOCALE);

interface TranslationEntry {
	msgid: string;
	msgstr: string;
	obsolete: boolean;
}

interface LocaleCatalog {
	activeCount: number;
	locale: string;
	messages: TranslationEntry[];
	untranslatedCount: number;
}

function parsePO(filePath: string): TranslationEntry[] {
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const entries: TranslationEntry[] = [];
	let currentId: string | null = null;
	let currentStr: string | null = null;
	let isObsolete = false;

	const idRe = /^msgid "((?:[^"\\]|\\.)*)"$/;
	const strRe = /^msgstr "((?:[^"\\]|\\.)*)"$/;

	for (const raw of lines) {
		const line = raw.trimEnd();
		if (line.startsWith("#~")) {
			isObsolete = true;
			continue;
		}
		if (line.startsWith("#")) {
			continue;
		}

		const idMatch = line.match(idRe);
		if (idMatch) {
			if (currentId !== null && currentStr !== null) {
				entries.push({
					msgid: currentId,
					msgstr: currentStr,
					obsolete: isObsolete,
				});
			}
			currentId = idMatch[1]!;
			currentStr = null;
			isObsolete = false;
			continue;
		}

		const strMatch = line.match(strRe);
		if (strMatch && currentId !== null) {
			currentStr = strMatch[1]!;
			entries.push({
				msgid: currentId,
				msgstr: currentStr,
				obsolete: isObsolete,
			});
			currentId = null;
			currentStr = null;
		}
	}

	if (currentId !== null && currentStr !== null) {
		entries.push({
			msgid: currentId,
			msgstr: currentStr,
			obsolete: isObsolete,
		});
	}

	return entries;
}

function loadLocale(locale: string): LocaleCatalog {
	const filePath = resolve(LOCALES_DIR, locale, "messages.po");
	if (!existsSync(filePath)) {
		console.error(`Catalog not found: ${filePath}`);
		process.exit(2);
	}

	const all = parsePO(filePath);
	const active = all.filter((e) => !e.obsolete && e.msgid !== "");
	const untranslated = active.filter((e) => e.msgstr === "");

	return {
		activeCount: active.length,
		locale,
		messages: active,
		untranslatedCount: untranslated.length,
	};
}

function run() {
	const args = process.argv.slice(2);
	const doExtract = args.includes("--extract");
	const jsonOutput = args.includes("--json");

	if (doExtract) {
		try {
			execSync("bunx lingui extract", {
				cwd: I18N_DIR,
				stdio: jsonOutput ? "pipe" : "inherit",
				timeout: 60_000,
			});
		} catch {
			console.error("lingui extract failed");
			process.exit(2);
		}
	}

	const source = loadLocale(SOURCE_LOCALE);
	const catalogs: Record<string, LocaleCatalog> = { [SOURCE_LOCALE]: source };
	for (const locale of TARGET_LOCALES) {
		catalogs[locale] = loadLocale(locale);
	}

	const sourceIds = new Set(source.messages.map((m) => m.msgid));

	const allIssues: {
		locale: string;
		key: string;
		type: "missing" | "untranslated" | "extra";
	}[] = [];

	for (const locale of TARGET_LOCALES) {
		const cat = catalogs[locale]!;
		const targetMap = new Map(cat.messages.map((m) => [m.msgid, m]));

		for (const id of sourceIds) {
			const targetEntry = targetMap.get(id);
			if (!targetEntry) {
				allIssues.push({ key: id, locale, type: "missing" });
			} else if (targetEntry.msgstr === "") {
				allIssues.push({ key: id, locale, type: "untranslated" });
			}
		}

		for (const [id] of targetMap) {
			if (!sourceIds.has(id)) {
				allIssues.push({ key: id, locale, type: "extra" });
			}
		}
	}

	const missingUntranslated = allIssues.filter(
		(i) => i.type === "missing" || i.type === "untranslated"
	);
	const extraKeys = allIssues.filter((i) => i.type === "extra");

	if (jsonOutput) {
		console.log(
			JSON.stringify(
				{
					issues: allIssues,
					locales: Object.fromEntries(
						Object.entries(catalogs).map(([loc, cat]) => [
							loc,
							{ total: cat.activeCount, untranslated: cat.untranslatedCount },
						])
					),
					passes: missingUntranslated.length === 0,
					source: SOURCE_LOCALE,
					summary: {
						extraKeys: extraKeys.length,
						locales: Object.fromEntries(
							TARGET_LOCALES.map((l) => [
								l,
								{
									untranslated: allIssues.filter(
										(i) =>
											i.locale === l &&
											(i.type === "missing" || i.type === "untranslated")
									).length,
								},
							])
						),
						missingTranslations: missingUntranslated.length,
						total: source.activeCount,
					},
				},
				null,
				2
			)
		);
		process.exit(missingUntranslated.length === 0 ? 0 : 1);
	}

	console.log("Translation Summary");
	console.log(`  Source: ${SOURCE_LOCALE} (${source.activeCount} messages)`);
	for (const locale of TARGET_LOCALES) {
		const cat = catalogs[locale]!;
		console.log(
			`  ${locale}: ${cat.activeCount} messages, ${cat.untranslatedCount} untranslated`
		);
	}

	if (missingUntranslated.length > 0) {
		console.log(`Missing translations: ${missingUntranslated.length}`);
		for (const locale of TARGET_LOCALES) {
			const localeIssues = missingUntranslated.filter(
				(i) => i.locale === locale
			);
			if (localeIssues.length === 0) {
				continue;
			}
			console.log(`  -- ${locale} (${localeIssues.length} missing) --`);
			for (const issue of localeIssues.slice(0, 30)) {
				const tag = issue.type === "missing" ? " MISSING " : " UNTRANSLATED";
				console.log(`    ${tag}: ${issue.key}`);
			}
			if (localeIssues.length > 30) {
				console.log(`    ... and ${localeIssues.length - 30} more`);
			}
		}
	}

	if (extraKeys.length > 0) {
		console.log(`Orphan keys (target but not source): ${extraKeys.length}`);
		for (const issue of extraKeys.slice(0, 10)) {
			console.log(`    ${issue.locale}: ${issue.key}`);
		}
		if (extraKeys.length > 10) {
			console.log(`    ... and ${extraKeys.length - 10} more`);
		}
	}

	if (missingUntranslated.length === 0) {
		console.log("All translations are complete.");
		process.exit(0);
	} else {
		console.log(
			`${missingUntranslated.length} translations missing. Run 'bun run i18n:extract' then translate missing entries.`
		);
		process.exit(1);
	}
}

run();
