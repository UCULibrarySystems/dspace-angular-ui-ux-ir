# Backend setup for goal badges, Discovery, and Browse by Goal

This guide describes **configuration-only** changes for a DSpace backend. It does not require a database migration, SQL update, or direct database write. Changes are made to DSpace XML/configuration files and are applied by restarting services and re-indexing Discovery.

## Compatibility review of the supplied backend configuration

| Framework | Frontend expects | Backend evidence supplied | Result |
| --- | --- | --- | --- |
| SDG | `local.subject.sdg` and Discovery filter `sdg`, with legacy `dc.subject` badge matching | `sdg.xml` and `local.subject.sdg` exist; normal submission uses `dc.subject` with `srsc` vocabulary | **Frontend aligned**: add the dedicated SDG field to the normal item form so new Items use the controlled vocabulary. |
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

The frontend configuration in this repository already uses this model, with `dc.subject` retained as a temporary legacy display-only fallback:

```yaml
goalBadges:
  sdg:
    enabled: true
    metadataFields: [local.subject.sdg, dc.subject]
    countSearchFilter: sdg
    imageFolder: sdg
    imagePrefix: 'sdg-'
    codes: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17']
```

If you intentionally keep SDGs in `dc.subject`, leave the current frontend setting in place, but staff must enter values beginning with `SDG01`, `SDG 1`, or `01`. The `sdg.xml` vocabulary will not be available in the normal form until it is assigned to a `dc.subject` field there.

## Submission forms

Add the three fields to the form used for normal Item deposits, usually `traditionalpagetwo` in `config/submission-forms.xml`. Do not place them only in `bitstream-metadata`; that form describes an uploaded file, not the repository Item.

### Why the fields do not appear in submission

The Angular frontend does **not** create submission fields. It only reads metadata already saved on an Item and reads Discovery facets for counts. A goal field will be absent from the submission screen when any one of these backend conditions is true:

1. The field was added to a submission form that is not assigned to the collection being tested.
2. The field was added to `bitstream-metadata` instead of the Item's normal submission form.
3. The `local.subject.sdg`, `local.subject.visiongoal`, or `local.subject.agenda2063` field is missing from the metadata registry, or the backend was not restarted after updating it.
4. The controlled vocabulary file is missing, has an invalid name, or is not referenced by the field's `<vocabulary>` element.
5. The collection uses a custom submission process whose form name is different from `traditionalpagetwo`.

Verify the collection's active submission form first. In the backend `config/submission-forms.xml`, find the collection handle (or its mapped submission process) and identify the form actually used by that collection. Add the three goal rows to that form, then restart the backend. Adding the rows to an unused form has no visible effect.

Use the following checks on the backend host before testing the browser:

```bash
# Each registry field must be present once.
grep -n 'local.subject.sdg\|local.subject.visiongoal\|local.subject.agenda2063' \
  [dspace]/config/registries/local-types.xml

# Each controlled-vocabulary file must exist.
ls [dspace]/config/controlled-vocabularies/sdg.xml \
   [dspace]/config/controlled-vocabularies/uganda-vision2040.xml \
   [dspace]/config/controlled-vocabularies/au-agenda2063.xml

# The active submission form must contain the three fields and vocabulary names.
grep -n 'subject.*sdg\|subject.*visiongoal\|subject.*agenda2063\|uganda-vision2040\|au-agenda2063' \
  [dspace]/config/submission-forms.xml
```

After updating `local-types.xml`, load the metadata registry into DSpace before attempting a submission. Metadata fields are stored in DSpace's database-backed registry; changing the XML file and restarting alone does not create the fields used by the REST API.

```bash
[dspace]/bin/dspace registry-loader -m [dspace]/config/registries/local-types.xml
```

Remove duplicate `<dc-type>` definitions (in particular, retain only one `local.subject.visiongoal` entry) before running the loader. Then restart the backend and begin a **new** submission in the target collection; an already-open submission can retain the form definition loaded before the restart.

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

### Authority-control settings required by controlled vocabularies

The vocabulary selector sends an authority value (for example, `sdg:SDG04`) with the selected label. DSpace rejects that value unless the corresponding metadata field is marked as authority controlled. Add the following to `config/local.cfg` (preferred, because it survives DSpace upgrades) or the active `config/modules/authority.cfg` override:

```properties
# Store and accept controlled-vocabulary authority identifiers for goal metadata.
authority.controlled.local.subject.sdg = true
authority.controlled.local.subject.visiongoal = true
authority.controlled.local.subject.agenda2063 = true

# Make authority storage explicit for these three controlled vocabularies.
vocabulary.plugin.sdg.authority.store = true
vocabulary.plugin.uganda-vision2040.authority.store = true
vocabulary.plugin.au-agenda2063.authority.store = true
```

Restart the DSpace backend after this change. If the backend log contains `The metadata field "local_subject_sdg" is not authority controlled but authorities were provided`, these settings are missing or are not being loaded by the active configuration.

## Discovery filters and Browse by Goal

In the backend Discovery configuration (commonly `config/spring/api/discovery.xml`), define a filter/facet and browse index for each dedicated field. Use the same short name in all three places: frontend `countSearchFilter`, Discovery filter, and browse index.

Conceptually, the definitions must map as follows; use the matching XML element syntax from your installed DSpace version's existing `subject` browse/filter entries.

```text
sdg        -> local.subject.sdg
visiongoal -> local.subject.visiongoal
agenda2063 -> local.subject.agenda2063
```

### Correct the supplied `discovery.xml` configuration

The two anonymous `DiscoverySearchFilterFacet` beans currently near the top of the supplied file are not referenced by `defaultConfiguration`, so they are not exposed through `/server/api/discover/facets`. Remove those anonymous beans and add these **named** beans alongside the existing `searchFilterSubject` bean definitions:

```xml
<!-- Goal-framework Discovery facets. Bean IDs are referenced below. -->
<bean id="searchFilterSDG" class="org.dspace.discovery.configuration.DiscoverySearchFilterFacet">
    <property name="indexFieldName" value="sdg"/>
    <property name="metadataFields"><list><value>local.subject.sdg</value></list></property>
    <property name="facetLimit" value="20"/>
    <property name="sortOrderSidebar" value="COUNT"/>
    <property name="sortOrderFilterPage" value="COUNT"/>
    <property name="isOpenByDefault" value="false"/>
    <property name="pageSize" value="20"/>
</bean>
<bean id="searchFilterVisionGoal" class="org.dspace.discovery.configuration.DiscoverySearchFilterFacet">
    <property name="indexFieldName" value="visiongoal"/>
    <property name="metadataFields"><list><value>local.subject.visiongoal</value></list></property>
    <property name="facetLimit" value="30"/>
    <property name="sortOrderSidebar" value="COUNT"/>
    <property name="sortOrderFilterPage" value="COUNT"/>
    <property name="isOpenByDefault" value="false"/>
    <property name="pageSize" value="30"/>
</bean>
<bean id="searchFilterAgenda2063" class="org.dspace.discovery.configuration.DiscoverySearchFilterFacet">
    <property name="indexFieldName" value="agenda2063"/>
    <property name="metadataFields"><list><value>local.subject.agenda2063</value></list></property>
    <property name="facetLimit" value="20"/>
    <property name="sortOrderSidebar" value="COUNT"/>
    <property name="sortOrderFilterPage" value="COUNT"/>
    <property name="isOpenByDefault" value="false"/>
    <property name="pageSize" value="20"/>
</bean>
```

Inside the existing `defaultConfiguration` bean, add the three references to the existing `searchFilters` list. This is required for the REST facet endpoint and frontend count status to work:

```xml
<ref bean="searchFilterSDG" />
<ref bean="searchFilterVisionGoal" />
<ref bean="searchFilterAgenda2063" />
```

Add those same references to `sidebarFacets` only if they should also be visible in the standard search sidebar. Do not add them to every entity-specific configuration unless the facet is required there too.

### Add metadata Browse indexes in `config/local.cfg`

Discovery facets power counts and filtered search. Your supplied `local.cfg` uses DSpace's compact browse syntax. The literal keys `webui.browse.index.N` and `webui.browse.index.N+1` are invalid and must be removed. Add this exact replacement block at the end of `local.cfg`:

```properties
##### Goal-framework browse indexes #####
# 1–9 are already used by the existing UCU browse menu; use 10–12.
webui.browse.index.10 = sdg:metadata:local.subject.sdg:text
webui.browse.index.11 = visiongoal:metadata:local.subject.visiongoal:text
webui.browse.index.12 = agenda2063:metadata:local.subject.agenda2063:text
```

The names are deliberately lower-case: they must exactly match the frontend filters and routes. The resulting browse URLs are `/browse/sdg`, `/browse/visiongoal`, and `/browse/agenda2063`.

### Add the Browse Repository menu entries

If the generated browse menu does not show the new indexes after restart and reindexing, add links to the repository browse menu in the backend's menu configuration (commonly `config/menus.xml`, using the same XML pattern as existing `browse/subject` links):

```xml
<menu-item>
  <text>By Sustainable Development Goal</text>
  <link>/browse/sdg</link>
</menu-item>
<menu-item>
  <text>By Vision 2040 Goal</text>
  <link>/browse/visiongoal</link>
</menu-item>
<menu-item>
  <text>By Agenda 2063 Goal</text>
  <link>/browse/agenda2063</link>
</menu-item>
```

Keep these links in the same `Browse Repository` submenu as Author, Title, and Subject. Some DSpace versions use JSON/YAML menu configuration instead of `menus.xml`; copy the existing subject menu item's structure and only change its label and path.

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

### Fast production checks

Run these checks after the backend restart and Discovery re-index. Replace the hostname with the repository's public backend URL.

```bash
# The response must contain a filter named "sdg".
curl -fsS https://repository.example.org/server/api/discover/search/objects | grep -o '"sdg"'

# The SDG facet must return values such as "SDG01: No Poverty" and positive counts.
curl -fsS 'https://repository.example.org/server/api/discover/facets/sdg' | grep -E 'SDG0[1-9]|SDG1[0-7]'

# Use the authority key and operator returned by the facet link. This must return matching objects.
curl -fsS 'https://repository.example.org/server/api/discover/search/objects?f.sdg=sdg%3ASDG01%2Cauthority' | grep -o 'totalElements[^,]*'
```

The browser's SDG tiles load their image files from `/assets/images/sdg/sdg-01.png` through `sdg-17.png` and counts from the `sdg` Discovery facet. After deploying the frontend, verify both directly:

```bash
curl -fI https://repository.example.org/assets/images/sdg/sdg-01.png
curl -fsS https://repository.example.org/assets/i18n/en.json | grep 'Sustainable Development Goals'
```

If either command returns an old or missing resource, PM2 is still serving an older `dist` release. Rebuild the UI with `npm run build:prod`, deploy the complete generated `dist` directory, then restart/reload the PM2 application. Do not deploy only `dist/browser` when the application uses SSR; deploy both `dist/browser` and `dist/server` from the same build.

## Frontend artwork

SDG image files are already in the frontend at `src/assets/images/sdg/`. To match the visual browse/badge design, add the official artwork without changing application code:

```text
src/assets/images/vision2040/opp01.png ... gov06.png
src/assets/images/agenda2063/agenda-01.png ... agenda-20.png
```

Until those files are supplied, the frontend intentionally shows a readable goal-code fallback rather than a broken image.
