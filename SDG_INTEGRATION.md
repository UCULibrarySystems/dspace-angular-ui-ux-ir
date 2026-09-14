# Metadata-driven goal badges

## Overview

Item pages can show badges and repository-output counts for three goal frameworks:

| Set key | Framework | Item metadata | Discovery filter |
| --- | --- | --- | --- |
| `sdg` | UN Sustainable Development Goals | `dc.subject` | `subject` |
| `ndp` | Uganda Vision 2040 / National Development Plan goals | `local.subject.visiongoal` | `visiongoal` |
| `agenda2063` | African Union Agenda 2063 goals | `local.subject.agenda2063` | `agenda2063` |

The browser matches item metadata to configured codes, renders only matching badges, and loads all counts for each displayed framework from one Discovery facet request. There is no classification service or custom frontend API.

When metadata matches a configured code, its row is shown on the item page. Each row also reports **Live repository counts active** when its configured Discovery facet responds, or explains that its Discovery filter is unavailable instead of misleading users with zero counts.

## Frontend configuration

The active production-style configuration is in `config/config.yml`; copy the same `goalBadges` block from `config/config.example.yml` when creating another deployment.

```yaml
goalBadges:
  sdg:
    enabled: true
    metadataFields: [dc.subject]
    countSearchFilter: subject
    imageFolder: sdg
    imagePrefix: 'sdg-'
    codes: ['01', '02', '03'] # continue through '17'
  ndp:
    enabled: true
    metadataFields: [local.subject.visiongoal]
    countSearchFilter: visiongoal
    imageFolder: vision2040
    imagePrefix: ''
    codes: [OPP01, FUND01, SOC01, GOV01] # full list is in config.yml
  agenda2063:
    enabled: true
    metadataFields: [local.subject.agenda2063]
    countSearchFilter: agenda2063
    imageFolder: agenda2063
    imagePrefix: 'agenda-'
    codes: ['01', '02', '03'] # continue through '20'
```

Set an individual framework's `enabled` value to `false` to hide it. `src/config/default-app-config.ts` provides disabled definitions for all three frameworks, so an incomplete local configuration hides badges instead of causing an application error.

## Value formats matched by the frontend

| Set | Accepted examples |
| --- | --- |
| `sdg` | `01`, `1`, `SDG 1`, `01: No Poverty` |
| `ndp` | `OPP01: Tourism`, `FUND03: ...`, `SOC09: ...`, `GOV06: ...` |
| `agenda2063` | `01: Goal label` through `20: Goal label` |

Only configured codes are rendered. Ordinary `dc.subject` text does not create an SDG badge unless it starts with an SDG number in one of the accepted formats.

## Source locations

| Purpose | File |
| --- | --- |
| Runtime configuration | `config/config.yml` |
| Deployment example | `config/config.example.yml` |
| Safe default configuration and code lists | `src/config/default-app-config.ts` |
| Configuration types | `src/config/goal-badge-config.interface.ts` |
| Code matching rules | `src/app/shared/goal-badges/goal-code-matchers.ts` |
| Generic badge component | `src/app/shared/goal-badges/goal-badges.component.ts` |
| Badge template and styling | `src/app/shared/goal-badges/goal-badges.component.html`, `src/app/shared/goal-badges/goal-badges.component.scss` |
| Item-page placement | `src/themes/custom/app/item-page/simple/` and `src/themes/custom/app/item-page/full/` |
| SDG images | `src/assets/images/sdg/sdg-01.png` through `sdg-17.png` |

The component is used three times on both item-page views:

```html
<ds-goal-badges [item]="item" set="sdg"></ds-goal-badges>
<ds-goal-badges [item]="item" set="ndp"></ds-goal-badges>
<ds-goal-badges [item]="item" set="agenda2063"></ds-goal-badges>
```

## Image assets

The supplied SDG files are already stored in `src/assets/images/sdg/`. Add the remaining official image files before enabling visual artwork for the other two sets:

```text
src/assets/images/vision2040/opp01.png ... gov06.png
src/assets/images/agenda2063/agenda-01.png ... agenda-20.png
```

Image file names are lower-case because the component resolves every configured code with `code.toLowerCase()`. Until an image is present, the badge deliberately falls back to displaying its code rather than showing a broken image icon.

## Backend integration required for counts

SDG works against standard DSpace `dc.subject` and its built-in `subject` filter. NDP and Agenda 2063 are frontend-configured, but their metadata values and live repository-wide counts require the DSpace backend to expose them.

1. Register `local.subject.visiongoal` and `local.subject.agenda2063` in the DSpace metadata registry.
2. Add controlled vocabularies (for example, `uganda-vision2040.xml` and `au-agenda2063.xml`) and reference them in the required submission forms.
3. Add Discovery facets named `visiongoal` and `agenda2063` for those metadata fields.
4. Re-index Discovery after the configuration change.
5. Confirm `/server/api/discover/facets/visiongoal` and `/server/api/discover/facets/agenda2063` return the configured values.

`countSearchFilter` is the backend Discovery filter name without the `f.` prefix. The component sends that filter in its search link and uses its facet response to populate the count. If a backend facet is absent, the badges still render from item metadata, but their counts remain zero and their search links cannot return filtered results.

## Production check

After building, verify `dist/browser/assets/config.json` contains all three `goalBadges` entries and that these asset directories contain their expected image files:

```text
dist/browser/assets/images/sdg/
dist/browser/assets/images/vision2040/
dist/browser/assets/images/agenda2063/
```
