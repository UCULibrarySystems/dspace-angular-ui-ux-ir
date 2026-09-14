# Backend setup for goal badges, Discovery, and Browse by Goal

This guide describes **configuration-only** changes for a DSpace backend. It does not require a database migration, SQL update, or direct database write. Changes are made to DSpace XML/configuration files and are applied by restarting services and re-indexing Discovery.

## Compatibility review of the supplied backend configuration

| Framework | Frontend expects | Backend evidence supplied | Result |
| --- | --- | --- | --- |
| SDG | `dc.subject` and Discovery filter `subject` | `sdg.xml` and `local.subject.sdg` exist; normal submission uses `dc.subject` with `srsc` vocabulary | **Mismatch**: SDG vocabulary entries are not currently selected through the normal item form, and `local.subject.sdg` is not the field read by the frontend. |
| NDP / Vision 2040 | `local.subject.visiongoal`, filter `visiongoal` | Registry field and `uganda-vision2040.xml` exist | **Partially ready**: add field to an item submission form and add a Discovery facet/filter. The supplied field is currently in `bitstream-metadata`, not the normal item form. |
| Agenda 2063 | `local.subject.agenda2063`, filter `agenda2063` | Registry field and `au-agenda2063.xml` exist | **Partially ready**: same item-form and Discovery additions are required. |

The duplicate `local.subject.visiongoal` entry shown in the supplied `local-types.xml` should be retained only once. It does not need a database migration; remove the duplicate from the registry XML before importing/updating the registry.

## Recommended metadata model

Use dedicated, controlled metadata fields for all three frameworks. This prevents ordinary subject keywords from accidentally becoming an SDG badge or browse term.

| Framework | Metadata field | Controlled vocabulary | Discovery filter/browse index |
| --- | --- | --- | --- |
| SDG | `local.subject.sdg` | `sdg` | `sdg` |
| NDP | `local.subject.visiongoal` | `uganda-vision2040` | `visiongoal` |
| Agenda 2063 | `local.subject.agenda2063` | `au-agenda2063` | `agenda2063` |

With this recommended model, update the frontend SDG block to match:

```yaml
goalBadges:
  sdg:
    enabled: true
    metadataFields: [local.subject.sdg]
    countSearchFilter: sdg
    imageFolder: sdg
    imagePrefix: 'sdg-'
    codes: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17']
```

If you intentionally keep SDGs in `dc.subject`, leave the current frontend setting in place, but staff must enter values beginning with `SDG01`, `SDG 1`, or `01`. The `sdg.xml` vocabulary will not be available in the normal form until it is assigned to a `dc.subject` field there.

## Submission forms

Add the three fields to the form used for normal Item deposits, usually `traditionalpagetwo` in `config/submission-forms.xml`. Do not place them only in `bitstream-metadata`; that form describes an uploaded file, not the repository Item.

```xml
<row><field>
  <dc-schema>local</dc-schema><dc-element>subject</dc-element><dc-qualifier>sdg</dc-qualifier>
  <repeatable>true</repeatable><label>Sustainable Development Goal(s)</label>
  <input-type>onebox</input-type><vocabulary closed="true">sdg</vocabulary>
</field></row>
<row><field>
  <dc-schema>local</dc-schema><dc-element>subject</dc-element><dc-qualifier>visiongoal</dc-qualifier>
  <repeatable>true</repeatable><label>Vision 2040 goal(s)</label>
  <input-type>onebox</input-type><vocabulary closed="true">uganda-vision2040</vocabulary>
</field></row>
<row><field>
  <dc-schema>local</dc-schema><dc-element>subject</dc-element><dc-qualifier>agenda2063</dc-qualifier>
  <repeatable>true</repeatable><label>Agenda 2063 goal(s)</label>
  <input-type>onebox</input-type><vocabulary closed="true">au-agenda2063</vocabulary>
</field></row>
```

The values must use the code format expected by the frontend: `SDG01: ...`, `OPP01: ...`, and `01: ...` respectively.

## Discovery filters and Browse by Goal

In the backend Discovery configuration (commonly `config/spring/api/discovery.xml`), define a filter/facet and browse index for each dedicated field. Use the same short name in all three places: frontend `countSearchFilter`, Discovery filter, and browse index.

Conceptually, the definitions must map as follows; use the matching XML element syntax from your installed DSpace version's existing `subject` browse/filter entries.

```text
sdg        -> local.subject.sdg
visiongoal -> local.subject.visiongoal
agenda2063 -> local.subject.agenda2063
```

For each field, add:

1. A Discovery search filter/facet so `/server/api/discover/facets/<name>` returns its values and counts.
2. A Discovery browse index so `/browse/<name>` resolves to that metadata browse.
3. A menu entry labelled **By SDG**, **By Vision 2040 Goal**, and/or **By Agenda 2063 Goal**, pointing to those browse URLs. DSpace normally exposes configured browse indexes automatically; if the custom menu is static, add the links there as well.

The supplied frontend has live status text on every displayed goal row. It changes to **Live repository counts active** only after the corresponding Discovery facet is available. If it reports a missing filter, first test:

```text
/server/api/discover/facets/sdg
/server/api/discover/facets/visiongoal
/server/api/discover/facets/agenda2063
```

## Apply and verify

1. Back up the configuration files.
2. Update controlled vocabularies, registry XML, submission forms, and Discovery configuration.
3. Restart DSpace so configuration and vocabularies reload.
4. Rebuild the Discovery index:

```bash
[dspace]/bin/dspace index-discovery -b
```

5. Create or edit one test Item for each framework using the normal submission form.
6. Verify each REST facet endpoint returns the submitted vocabulary value and a positive count.
7. Open the item page: the matching badge row should appear and say **Live repository counts active**.
8. Open `/browse/sdg`, `/browse/visiongoal`, or `/browse/agenda2063`: the configured browse index should show the controlled values. The frontend Browse Repository menu should include the corresponding links.

## Frontend artwork

SDG image files are already in the frontend at `src/assets/images/sdg/`. To match the visual browse/badge design, add the official artwork without changing application code:

```text
src/assets/images/vision2040/opp01.png ... gov06.png
src/assets/images/agenda2063/agenda-01.png ... agenda-20.png
```

Until those files are supplied, the frontend intentionally shows a readable goal-code fallback rather than a broken image.
