# Bastet

[Bastet.ai](https://bastet.ai) is the top-level home for an open security network spanning internet measurement, vulnerability disclosure, review, and contributor incentives.

## The network

- [CheapBugs](https://cheapbugs.net) — protected vulnerability intake and onchain review
- [NWeb](https://nweb.io) — distributed internet measurement and attestations
- [MassPull](https://github.com/pierce403/masspull) — large-scale scan collection tooling
- [ScanToken](https://scantoken.org) — incentives for useful measurement data
- [Bastet the Protector](https://app.virtuals.io/virtuals/20236) — the Virtuals-native coordination layer

## Site

The site is dependency-free HTML, CSS, and JavaScript. Cloudflare Workers Static Assets serves the public files built into `dist/`. `app.js` reads Bastet's public Virtuals profile to show current token metrics and automatically detects an ACP agent ID after migration.

Open `index.html` directly for the static content, or serve the repository locally to test live API behavior:

```sh
python3 -m http.server 8080
```

The previous Bastet site is preserved at [`/legacy/`](https://bastet.ai/legacy/). See [VIRTUALS.md](VIRTUALS.md) for the integration boundary and activation plan.

### Cloudflare deployment

Use Node.js 22 or newer and the pinned Wrangler installation:

```sh
npm ci
npm run check:deploy
npm run dev
```

`npm run deploy` builds and publishes the `bastet` Worker. The build copies an explicit list of public files and directories; local configuration and deployment tooling are excluded. Existing HTML links, `/legacy/`, and `/api/crystals/` remain reachable. Missing paths return 404.

Connect `pierce403/bastet` to the `bastet` Worker in Workers Builds. Use repository root `/`, production branch `main`, build command `npm run build`, deploy command `npm run deploy`, and preview command `npm run deploy:preview`. No application secrets or database bindings are needed. `.nvmrc` selects Node.js 22 for builds.

The initial configuration deploys to `workers.dev` for verification. After checking the preview, add the `bastet.ai` custom domain to the Wrangler configuration and deploy it. Keep the GitHub Pages deployment and its `CNAME` available until the Cloudflare custom domain has been verified. Workers logs and traces are enabled for any Worker execution; direct static asset responses do not run application code.

## Security model

Bastet is intended to coordinate explicitly authorized and scoped defensive work. Automated findings require human verification before disclosure, remediation claims, or rewards.
