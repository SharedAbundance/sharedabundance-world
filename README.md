# Shared Abundance

Public website for [sharedabundance.world](https://sharedabundance.world). Building productive businesses with AI and automation, then sharing available surplus equally among eligible members.

**Status:** Shared Abundance · Building the commons

## Stack

Plain semantic HTML, CSS, and a small amount of vanilla JavaScript. No framework. Hosted on GitHub Pages from the `main` branch with custom domain `sharedabundance.world`.

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home: proposition, process, and entry points |
| `/how-it-works/` | Model detail, finances, growth, industries, FAQ |
| `/join/` | Join: signup form (needs Mini backend) |
| `/join/invite/` | Help us grow: invite two people (after email activation) |
| `/business-001/` | Redirect stub to `/join/` (old links) |
| `/pioneers/` | Early support with temporary, defined terms |
| `/rules/` | Principles v0.1 and safeguards |
| `/progress/` | Milestones from concept to operation |
| `/contribute/` | Local contribution and improvement draft tools |

## Local preview

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/

## Contribution drafts

Until a submission backend is configured, `/contribute/` keeps drafts in the browser and offers download (and copy for improvement drafts). Nothing is sent to a server. Status messaging makes that explicit.

## Assets

Nineteen PNG illustrations live in `assets/`. They depict the industries and operating model Shared Abundance is building toward, not existing Shared Abundance operations.

## Configuration still needed (owner)

- Public submission / contact endpoint (optional)
- Contact email (only when confirmed for this site)
- Analytics, legal entity details, privacy policy (if/when applicable)
- DNS is already assumed configured for GitHub Pages; this repo keeps `CNAME` and `.nojekyll`

## License / notice

Illustrations are artwork of the direction ahead. Do not treat page examples as forecasts, accounts, or offers of investment.
