# Bastet × Virtuals

Bastet the Protector is [Virtuals agent 20236](https://app.virtuals.io/virtuals/20236) on Base.

## Current integration

The public site reads the Virtuals profile endpoint directly in the browser and displays:

- agent and token status
- market cap in VIRTUAL
- USD liquidity and 24-hour volume
- holder count
- the current Base token contract
- ACP registration status

The request is read-only and uses no wallet connection, API key, or server-side secret. If the endpoint is unavailable, the site clearly marks metrics unavailable and retains links to the canonical Virtuals profile and BaseScan.

Agent 20236 is currently an `UNDERGRAD` bonding profile. Its active bonding token is `0xB34bE18a6F069F00702caC8155C128A91C28CeC4`. The site prefers the graduated `tokenAddress` automatically if Virtuals adds one later.

## Activation path

The following steps require the agent owner's authenticated Virtuals session and are therefore intentionally not performed by the public website:

1. Migrate Bastet into the EconomyOS identity and banking layer.
2. Register the agent for ACP v2 and provision its non-custodial wallet.
3. Publish narrowly scoped services with explicit authorization requirements.
4. Connect ACP job hooks to a Bastet runtime built with the GAME SDK and project-specific tools.
5. Start with human approval on every job, then automate only low-risk, reversible stages after evaluation.

Once Virtuals returns an `acpAgentId` or `v3AcpAgentId`, the homepage automatically changes the integration panel from “awaiting registration” to active and displays the agent ID.

## Candidate ACP services

These services fit the project network without turning Bastet into an unrestricted offensive agent:

- **Scope intake** — validate an asset list, proof of authorization, timing, and rate limits.
- **Measurement enrichment** — summarize NWeb or MassPull observations for a defined scope.
- **Disclosure preparation** — package public-safe metadata for CheapBugs while keeping sensitive evidence encrypted.
- **Finding triage** — deduplicate and prioritize submitted evidence for a human reviewer.
- **Peer review** — request a second opinion and record the reviewer outcome before rewards.

Every service should reject ambiguous authorization, private targets outside the declared scope, destructive actions, credential use, persistence, and attempts to bypass access controls.

## Runtime boundary

GitHub Pages can present live public data, but it cannot safely hold agent keys, receive authenticated ACP jobs, or execute security tooling. The ACP provider runtime must be deployed separately with secrets management, signed request verification, per-job isolation, audit logs, quotas, and a human stop control.
