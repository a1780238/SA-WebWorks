# Torah Gate MCP

A real MCP plugin prototype that evaluates proposed decisions through explicit Torah/halakhic gates instead of free-form AI opinion.

## What v0.1 actually does

- Exposes `torah_evaluate_decision` over MCP at `/mcp`.
- Uses Hebcal's Assur Melacha API to determine whether a supplied event interval intersects a Shabbat/Yom-Tov period in which melacha is prohibited.
- Returns exactly `PASS`, `FAIL`, or `HOLD`.
- Issues `FAIL` when a verified prohibited-time overlap exists and the supplied facts already establish that performing the event requires prohibited melacha.
- Issues `HOLD` for missing facts, unknown activity classification, possible emergency exceptions, provider failures, or incomplete full-Torah rule coverage.
- Will only issue `PASS` when the caller explicitly scopes the request to the installed Shabbat/Yom-Tov calendar gate.

This is intentional. A plugin that claims to have checked "all Torah commandments" when it has not is worse than useless.

## Run locally

```bash
npm test
npm run dev
```

MCP endpoint: `http://127.0.0.1:3000/mcp`

## Deploy on Vercel

The repository is dependency-free and uses a Vercel Node Function at `api/mcp.js`. `vercel.json` rewrites the public `/mcp` path to the function.

After deployment, connect `https://YOUR-DOMAIN/mcp` as a developer-mode MCP server in ChatGPT Plugins.

## Input contract

The calling AI should extract facts, not invent them. In particular:

- `event.start` and optional `event.end`: ISO-8601 with explicit offset.
- `event.location`: latitude, longitude, and IANA `tzid`.
- `event.melachaRequirement`: `yes`, `no`, or `unknown`.
- `scope`: `shabbat_yomtov_only` or `full_torah`.

The AI must use `unknown` when it has not actually established the halakhic classification of the required acts.

## Why PASS is scope-limited

Version 0.1 does not yet encode ribbis, ona'ah, geneivat da'at, property rights, contracts, speech rules, damages, positive obligations, exception logic, minhag/psak profiles, or personal applicability. Therefore a clean calendar result cannot honestly imply a complete Torah approval.

## Source layer

The tool returns links to:

- Exodus 20:8-11
- Deuteronomy 5:12-15
- Mishnah Shabbat 7:2
- Hebcal Assur Melacha API

Hebcal documents that its Assur Melacha function uses an 8.5-degree solar-depression convention for the end time. A production system should make the user's zmanim/psak profile configurable rather than treating one convention as universal.
