# Bastet

[Bastet.ai](https://bastet.ai) is the top-level home for an open security network spanning internet measurement, vulnerability disclosure, review, and contributor incentives.

## The network

- [CheapBugs](https://cheapbugs.net) — protected vulnerability intake and onchain review
- [NWeb](https://nweb.io) — distributed internet measurement and attestations
- [MassPull](https://github.com/pierce403/masspull) — large-scale scan collection tooling
- [ScanToken](https://scantoken.org) — incentives for useful measurement data
- [Bastet the Protector](https://app.virtuals.io/virtuals/20236) — the Virtuals-native coordination layer

## Site

The site is dependency-free HTML, CSS, and JavaScript hosted on GitHub Pages with the `bastet.ai` custom domain. `app.js` reads Bastet's public Virtuals profile to show current token metrics and automatically detects an ACP agent ID after migration.

Open `index.html` directly for the static content, or serve the repository locally to test live API behavior:

```sh
python3 -m http.server 8080
```

The previous Bastet site is preserved at [`/legacy/`](https://bastet.ai/legacy/). See [VIRTUALS.md](VIRTUALS.md) for the integration boundary and activation plan.

## Security model

Bastet is intended to coordinate explicitly authorized and scoped defensive work. Automated findings require human verification before disclosure, remediation claims, or rewards.
