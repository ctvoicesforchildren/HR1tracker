# Connecticut Benefits Tracker

An embeddable SNAP and Medicaid dashboard comparing enrollment with July 2025. Includes official statewide totals, municipality data, estimated district allocations, HUSKY component trends, policy milestones, and SNAP recommendations.

## Publish on GitHub Pages

1. Upload this folder's contents to the root of your public repository on the `main` branch. Include the hidden `.github` folder, `.gitignore`, and `.nojekyll`. No installation or build command is needed locally.
2. Enable GitHub Actions. In Settings → Pages, select **GitHub Actions** as the source.
3. Allow Actions to write repository contents. Branch rules must allow the workflow's automated data commits.
4. In Actions, run **Refresh DSS and publish** and confirm that it succeeds. Use the Pages URL shown by the successful deployment.

Uploading this package does not itself confirm that publishing or scheduled updates are active. Check the first run and monitor later runs for failures. No Node packages, Python dependencies, workbook, or API key are required. An optional `SOCRATA_APP_TOKEN` can be stored in repository Secrets for API rate limits; never place credentials in files.

## Automatic updates

The workflow checks both public DSS sources every Monday at 11:17 UTC (6:17 a.m. Eastern Standard Time / 7:17 a.m. Eastern Daylight Time), and on pushes to `main` or manual runs. GitHub can delay schedules and may disable schedules in inactive public repositories after 60 days.

- Statewide totals: https://data.ct.gov/d/chsv-phja
- Municipality counts and district estimates: https://data.ct.gov/d/g7bd-zbqw

When source metadata changes, the updater retrieves history from January 2025 forward, validates it, and publishes the latest shared reporting month. Historical corrections can change earlier comparisons. Checks without changes update the check timestamp. Invalid downloads or failed checks prevent publication; the previous successful site remains available. Validation is not an official certification that a monthly release is complete.

The workflow commits validated data and update records before deployment. If publishing fails after that commit, rerun the workflow. Review failures rather than bypassing validation. District boundaries, allocation weights, policy recommendations, and milestones do not update automatically.

## Embed in WordPress

Paste this into a Custom HTML block and replace the example URL with your deployed Pages URL:

```html
<iframe id="benefits-tracker"
  src="https://YOUR-ACCOUNT.github.io/YOUR-REPOSITORY/"
  title="Connecticut safety net benefits tracker"
  style="width:100%;height:1200px;border:0;display:block">
</iframe>
<script>
const frame = document.getElementById('benefits-tracker');
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow ||
      event.origin !== new URL(frame.src).origin) return;
  const d = event.data;
  if (d?.type === 'ct-benefits-height' && Number.isFinite(d.height) &&
      d.height >= 200 && d.height <= 20000) {
    frame.style.height = d.height + 'px';
  }
});
</script>
```

If WordPress removes scripts, have the site administrator add the listener through the site's approved method. The iframe still works at its fixed height without the listener; adjust that height for the host page.

## Editing and file guide

| Files | Purpose / when to edit |
| --- | --- |
| `index.html` | Dashboard structure, recommendations, and visible source explanations. |
| `app.js` | Interactive behavior, chart/map labels, policy milestones, and program-specific text. |
| `style.css` | Colors, spacing, typography, and responsive layout. |
| `data.js` | Generated enrollment data and municipality shapes; replaced by the updater. |
| `districts.js` | District boundaries and population allocation weights; maintained separately. |
| `refresh-status.js` | Generated last-check status. |
| `favicon.svg` | Blue Connecticut silhouette browser icon. |
| `sources/config.json` | Program codes, HUSKY mapping, and baseline configuration. Review definitions before changing. |
| `sources/towns.geojson` | Municipality geometry and the expected 169-town list used by the updater. |
| `sources/live-state.json` | Generated source revision ledger used to detect changes. |
| `sources/live-report.json` | Generated validation and statewide/town reconciliation record. |
| `scripts/refresh_live.cjs` | Downloads and validates both public datasets. |
| `scripts/test_live.cjs` | Checks calculations, district allocation totals, HUSKY sums, and rejection of invalid data. |
| `.github/workflows/pages.yml` | Weekly scheduling, validation, data commits, and Pages publishing. |
| `METHODOLOGY.md` | Source definitions, calculations, district allocation notes, and limitations; linked from the dashboard. |
| `README.md` | This setup, embedding, and maintenance guide. |
| `.gitignore`, `.nojekyll` | Repository housekeeping and static-site support. |

For local maintenance with Node.js 22:

```sh
node scripts/refresh_live.cjs
node scripts/test_live.cjs
```

Use `node scripts/refresh_live.cjs --force` to re-download despite unchanged source metadata, including after changing updater logic. Test interface or calculation edits before pushing. Use GitHub Pages or a local web server to preview the multi-file dashboard.

## Public repository scope

This package includes only the dashboard, its automated maintenance files, and documentation. Archived workbooks, offline conversion tools, standalone preview builders, mockup images, and duplicate guides are omitted. Allocation audit details are consolidated in `METHODOLOGY.md`.

Everything committed to a public repository—including the update records—is publicly accessible. The workflow publishes only the dashboard assets and methodology to the website, but that deployment filter does not make other repository files private. Browser-delivered code, data, and allocations can be downloaded. Removing files from a later commit does not remove earlier copies from Git history.

No open-source license is included for original code, design, or writing. Public DSS/Census data and Connecticut Voices for Children branding retain their respective ownership.
