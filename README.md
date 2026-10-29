# Connecticut Voices for Children-- HR1 Tracker

A SNAP and Medicaid dashboard comparing the most recent available month of enrollment data with July 2025. Includes official statewide totals, municipality data, estimated district allocations, HUSKY component trends, policy milestones, and SNAP recommendations.

## Publish on GitHub Pages

1. Upload this folder's contents to the root of your public repository on the `main` branch. Include the hidden `.github` folder, `.gitignore`, and `.nojekyll`. No installation or build command is needed locally.
2. Enable GitHub Actions. In Settings → Pages, select **GitHub Actions** as the source.
3. Allow Actions to write repository contents. Branch rules must allow the workflow's automated data commits.
4. In Actions, run **Refresh DSS and publish** and confirm that it succeeds. Use the Pages URL shown by the successful deployment.

## Automatic updates

The workflow checks both public DSS sources every Monday at 11:17 UTC (6:17 a.m. Eastern Standard Time / 7:17 a.m. Eastern Daylight Time), and on pushes to `main` or manual runs. 

- Statewide totals: https://data.ct.gov/d/chsv-phja
- Municipality counts and district estimates: https://data.ct.gov/d/g7bd-zbqw

When source metadata changes, the updater retrieves history from January 2025 forward, validates it, and publishes the latest shared reporting month. Historical corrections can change earlier comparisons. Checks without changes update the check timestamp. Invalid downloads or failed checks prevent publication; the previous successful site remains available. Validation is not an official certification that a monthly release is complete.

The workflow commits validated data and update records before deployment. If publishing fails after that commit, rerun the workflow. Review failures rather than bypassing validation. District boundaries, allocation weights, policy recommendations, and milestones do not update automatically.
