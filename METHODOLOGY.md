# Sources and methods

## Source roles
Statewide totals and statewide HUSKY component lines use DSS Types of Assistance Participation by Month: https://data.ct.gov/d/chsv-phja . Municipality values, map shading, and district estimates use DSS People Served by Town and Type of Assistance: https://data.ct.gov/d/g7bd-zbqw . Statewide is not the sum of the map. Source coverage and suppression differ. The two series are not artificially reconciled; differences are recorded by program and month in sources/live-report.json.

## Automated refresh
The GitHub workflow checks both datasets every Monday at 11:17 UTC and on pushes/manual runs. Source metadata determines whether to download all records from January 2025 forward. Downloads use stable ordering and pagination verified against row counts. Metadata is checked again after retrieval to reject mixed revisions. Both sources must pass validation before any new data is published. The last successful public deployment remains available on failures. Checks without source changes retain the data and update the check timestamp.

The displayed months are limited to the shared reporting horizon. Later months available from only one source are withheld. Existing July 2025 and later values can change when DSS revises history. Source update time, reporting month, successful sync and successful check are different concepts and displayed separately. Schedule timing depends on GitHub Actions; no visitor must open the dashboard to trigger a check. A downloaded HTML preview is a snapshot.

Validation includes 169 towns, continuous months, baseline presence, unique source keys, nonnegative integer counts, all town/program/month combinations, valid HUSKY mappings, and component sums. A >15% fall in category-row coverage or >30% monthly change in statewide or aggregate town totals blocks automatic publication for human review. These are screening thresholds, not substantive bounds on real-world change. Validation cannot guarantee a completed official release. Missing individual category rows can still mean unavailable data; they are not proof of zero participation.

## Program definitions
SNAP codes: TP09, TBA.
Medicaid codes: D01, D03, D04, D10, D11, D25, F06C, F06P, F99, G06-I, G99, H01, L01, L99, M01, M04, M06, M07, M08, M09, M10, M11, N01, P99, S01, S02, S03, S04, S05, S95, S99, T01, W01, X01, X02, X03, X04, X07, X10, X25.
These selected categories include HUSKY A, C, D and LB, excluding explicitly state-funded/refugee categories. HUSKY B is CHIP and is excluded. The same program code lists apply to both sources. All HUSKY component sums reconcile to their displayed Medicaid total. Future category changes require review in sources/config.json.

## Measures
Map and net/percent headline metrics compare July 2025 to the selected month. Net loss = baseline minus selected-month count. Percent loss divides that difference by the baseline; a zero baseline makes the percentage unavailable. Negative losses are gains. Only the third headline metric compares with the preceding month. These counts may include people in multiple assistance categories. Do not add SNAP and Medicaid as distinct people, or interpret net changes as all exits. Published town counts below five are suppressed to zero. July 2025 overlaps enactment and is not a fully pre-law baseline. The datasets do not identify the cause of a loss.

## District estimates and maps
District estimates sum town counts multiplied by supplied normalized 2020 Census population shares. They do not allocate the statewide dataset. Percent changes use allocated totals, not mean town percentages. Calculations retain decimals until display. Boundaries are 2026 legislative districts and the 120th Congress, held fixed across months. Population distribution need not match recipient distribution. Two unmatched geographic-code rows per original allocation file were excluded: 0914046520 and 0917014160, each with a reported population of 726 and allocation share of 1. Both referenced House district 083, Senate district 013, and Congressional district 05. Town shares were normalized to sum to one: original House sums were 0.9999 for East Hartford, Hartford, Fairfield, Ledyard and Danbury, and 1.0001 for Bridgeport, Bristol, Meriden, Wallingford and West Haven; Senate sums were 0.9999 for Hartford, Darien and Stamford. Congressional shares required no normalization. The retained allocations cover 151 House, 36 Senate and 5 Congressional districts. The supplied weights and geometry do not update automatically.
Municipal geometry: Connecticut DOT towns, simplified for display. District geometry: https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer .

## Policy context
Policy markers are editorial, sourced annotations in app.js, not inferred from changes in counts. They align to monthly observations; future milestones are described but not plotted beyond available data. The HUSKY D work-rule note does not imply every enrollee is subject to the rules. Policy text and milestones require separate review as policies change.

