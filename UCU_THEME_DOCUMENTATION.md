# UCU Institutional Repository Theme Guide

This document describes the Uganda Christian University (UCU) branding and user-interface customizations in this DSpace Angular repository. It is the maintenance reference for future developers, library staff, and deployment administrators.

The repository is the frontend for the UCU Digital Institutional Repository. The DSpace backend remains a separate application and supplies the REST API, search index, authentication, metadata, and repository records.

## Customization Feature Summary

The current UCU UI/UX layer provides:

- UCU Libraries and Archives branding across the header, login, logout, home page, metadata fallbacks, social sharing metadata, and browser icons.
- UCU blue, maroon, yellow, and green design tokens for navigation, buttons, links, borders, alerts, and focus states.
- Trebuchet MS as the primary interface font with system-font fallbacks.
- A utility header with the latest repository additions link and official UCU social profiles.
- A simplified repository header with the UCU Libraries and Archives logo, search, language, authentication controls, and no admissions `Apply Now` button.
- Responsive header and hamburger navigation for phone, tablet, desktop, and widescreen layouts.
- UCU-maroon lower footer section with responsive policy/help links and no hover underlines.
- A compact homepage research-impact slider managed by Site Administrators through CMS metadata.
- In-browser PDF previews on item pages for accessible open-access PDF bitstreams.
- A sitewide accessibility menu with profiles, reader controls, content controls, color modes, navigation controls, language selection, and persistent preferences.
- UCU-branded Orejime cookie consent notice and settings modal with responsive layout and keyboard focus states.
- Repository-oriented SEO metadata, Dublin Core and citation metadata, Open Graph/Twitter metadata, geographic metadata, and JSON-LD descriptions.
- Public sitemap and robots configuration that exposes repository content while excluding administrative and query-heavy routes.
- UCU-adjusted repository information pages for deposit guidance, data reuse, service level, terms, preservation, notice and takedown, and quality assurance.

This document is the maintenance reference for these features and their source locations.

## Active Theme

The deployed theme is `ucu-branding`.

```text
ucu-branding -> custom -> DSpace base theme
```

The deploy-time theme selection and favicon head tags are in:

```text
config/config.yml
```

The Angular build includes the theme bundles in:

```text
angular.json
```

The UCU theme is an alias of the custom theme in:

```text
src/themes/ucu-branding/styles/theme.scss
```

Do not create a separate copy of the custom theme for ordinary branding changes. Edit the custom theme source and keep the `ucu-branding` alias pointing to it.

## Feature-to-File Map

| Feature | Primary source files | Also check |
| --- | --- | --- |
| Runtime theme selection | `config/config.yml` | `src/config/default-app-config.ts` |
| Build-time theme bundles | `angular.json` | `src/themes/ucu-branding/styles/theme.scss` |
| Header markup | `src/themes/custom/app/header/header.component.html` | `src/themes/dspace/app/header/header.component.html` |
| Header spacing, logo, and responsive controls | `src/themes/custom/app/header/header.component.scss` | `src/themes/dspace/app/header/header.component.scss` |
| Mobile hamburger navigation | `src/themes/dspace/app/header-nav-wrapper/header-navbar-wrapper.component.scss` | `src/themes/dspace/app/header-nav-wrapper/header-navbar-wrapper.component.html` |
| Homepage research-impact slider | `src/app/home-page/home-page.component.*` | `src/themes/custom/app/home-page/home-page.component.ts` |
| Site admin CMS editor helper | `src/app/admin/admin-edit-cms-metadata/` | `src/config/default-app-config.ts` CMS metadata list |
| Footer markup and info links | `src/app/footer/footer.component.html` | `src/app/footer/footer.component.ts` |
| Footer maroon strip styling | `src/app/footer/footer.component.scss` | `src/styles/_custom_variables.scss` |
| Sitewide accessibility launcher and panel | `src/app/accessibility/sitewide-accessibility/` | `src/app/app.component.html`, `src/app/app.component.ts` |
| Accessibility preference effects | `src/styles/_global-styles.scss` | `src/app/accessibility/sitewide-accessibility/sitewide-accessibility.component.scss` |
| Cookie consent appearance | `src/styles/_global-styles.scss` | `src/app/core/cookies/browser-orejime.service.ts`, `src/app/core/cookies/orejime-configuration.ts` |
| Cookie consent text | `src/assets/i18n/en.json5` | Active locale JSON5 files and privacy page |
| Accessibility cursor assets | `src/assets/images/accessibility-cursor.svg` and `accessibility-pointer.svg` | Accessibility global styles |
| Main repository logo | `src/assets/images/ucu-logo-lib.png` | `src/index.html`, runtime head tags |
| Compact logo | `src/assets/images/ucu-logo-mini.png` | Compact or fallback logo references |
| Authenticated admin sidebar icon | `src/assets/images/favicon.png` | `src/app/admin/admin-sidebar/admin-sidebar.component.html` |
| Favicon and app icons | `src/assets/custom/images/favicons/` | `config/config.yml`, `src/config/default-app-config.ts` |
| SEO metadata | `src/index.html` | `src/config/default-app-config.ts`, `config/config.yml` |
| Robots and sitemap origin | `src/robots.txt.ejs` | `config/config.yml`, reverse proxy headers |
| Community heading and interface text | `src/assets/i18n/en.json5` | Other active locale files |
| Privacy policy page | `src/app/info/privacy/privacy-content/privacy-content.component.html` | `src/assets/i18n/en.json5` |
| UCU repository info pages | `src/app/info/<page>/` | `src/themes/custom/app/info/<page>/`, `src/app/info/info-routes.ts` |
| Info page path constants | `src/app/core/router/info-routing-paths.ts` | Footer links and translation keys |
| Item PDF preview | `src/app/item-page/simple/field-components/file-section/pdf-bitstream-preview/` | Simple/full file-section components and custom theme wrappers |
| Default UI/runtime settings | `src/config/default-app-config.ts` | `src/environments/environment*.ts` |
| SSR settings | `config/config.yml`, `src/environments/environment.ts` | `src/environments/environment.production.ts` |

## Header and Navigation

The active UCU header is maintained in both theme header directories because the repository can resolve either the custom or DSpace header depending on theme configuration. Keep these files synchronized:

```text
src/themes/custom/app/header/header.component.html
src/themes/custom/app/header/header.component.scss
src/themes/dspace/app/header/header.component.html
src/themes/dspace/app/header/header.component.scss
```

The header contains:

- UCU utility bar and official social-media links.
- The latest repository additions link.
- The UCU Libraries and Archives logo.
- Desktop navigation through `ds-navbar`.
- A full repository search field beneath the main navigation.
- Header guidance tabs for depositing, data reuse, and repository governance/quality policies.
- Language, authentication, and context controls.
- The mobile hamburger trigger.

The guidance tabs and repository search are intentionally part of the shared header, so they remain available away from the home page. The home-page search form is omitted to avoid presenting the same search control twice. On narrow screens, the guidance tabs become a horizontally scrollable row and the search button uses its icon-only treatment.

The former `Apply Now` admissions button was intentionally removed from both active header templates. This repository header should point users toward repository discovery and account actions, not undergraduate admissions. If an admissions link is ever reintroduced, it should be discussed with the repository team and added to both header templates with responsive behavior verified.

### Latest Repository Additions Link

The `Check for recent website updates` link must use DSpace search pagination parameters:

```text
/search?spc.page=1&spc.sf=dc.date.accessioned&spc.sd=DESC
```

In the templates, the equivalent Angular binding is:

```html
[routerLink]="['/search']"
[queryParams]="{ 'spc.page': 1, 'spc.sf': 'dc.date.accessioned', 'spc.sd': 'DESC' }"
```

`dc.date.accessioned` represents when a record was added to the repository. `DESC` places the newest additions first. If this behavior changes, also check the home-page recent submissions configuration in `src/config/default-app-config.ts` and the `RecentItemListComponent`.

### Social Media Links

The current official UCU profiles are represented as icon-only links with accessible labels and tooltips:

- LinkedIn: `uganda-christian-university-mukono`
- Facebook: `UgandaChristianUniversity`
- Instagram: `ucuniversity_official`
- TikTok: `ucuniversity_official`
- X: `UCUniversity`
- YouTube: channel `UCMryuGybZ_pZxqqeEIp_q4Q`

When replacing a profile, update the HTML in both header theme files. Keep `aria-label`, `title`, `target="_blank"`, and `rel="noopener noreferrer"` on every external link. The icon classes come from Font Awesome, which is loaded in:

```text
src/styles/helpers/_font_awesome_imports.scss
```

## Footer

The footer is shared by the base app and the custom theme wrapper:

```text
src/app/footer/footer.component.html
src/app/footer/footer.component.scss
src/themes/custom/app/footer/footer.component.ts
```

The current footer contains:

- UCU copyright and licence text.
- Cookie settings action when cookie consent is enabled.
- Accessibility settings.
- Deposit guidance.
- Data reuse.
- Service level.
- Terms of use.
- Preservation.
- Notice and takedown.
- Quality assurance.
- Privacy policy.
- End user agreement.
- Send feedback.
- COAR Notify support when enabled.

The lower footer section is intentionally UCU maroon:

```scss
.bottom-footer {
  background: var(--ucu-maroon);
  border-top: 4px solid var(--ucu-yellow);
}
```

Footer links are designed to wrap neatly when there are many policy links. Do not force them into a single no-wrap row on narrow screens. The link hover state changes color without adding underlines, while keyboard users still receive a visible `:focus-visible` outline.

When adding or renaming a footer link:

1. Add or update the route in `src/app/footer/footer.component.html`.
2. Add the label key in `src/assets/i18n/en.json5`.
3. Add matching placeholder or translated keys in active locale files such as `src/assets/i18n/sw.json5`.
4. Confirm the footer still wraps cleanly at 320px, 390px, 768px, and desktop widths.

## Homepage Research-Impact Slider

The compact homepage research-impact slider is rendered from site CMS metadata:

```text
dspace.cms.home-header
```

Site Administrators can update it from:

```text
/admin/edit-cms-metadata
```

Select `dspace.cms.home-header`. The editor includes helper buttons to insert a slide template or upload a slide image. Uploaded images are inserted as data URLs into the CMS metadata field, which is convenient for small managed banners. For very large or frequently changed images, prefer uploading an optimized image asset to the repository deployment and referencing its URL in the `image:` field.

Each slide uses this editable block format:

```text
---
kicker: UCU Research Impact
title: Article title
subtitle: Short article subtitle
summary: One concise sentence about why this research matters.
image: assets/images/ucu-logo-lib.png
alt: Short description of the image
link: /items/item-uuid-or-handle
button: Read more
findings:
- First research impact highlight
- Second research impact highlight
- Third research impact highlight
```

Use one `---` separated block per slide. The `link:` value should point to an item page or article detail route inside the same repository, so the `Read more` button keeps users in the system. External URLs are normalized to their path only; the slider is intended for repository content, not outside news pages.

The slider parser and fallback slide are maintained in:

```text
src/app/home-page/home-page.component.ts
```

The compact visual layout is maintained in:

```text
src/app/home-page/home-page.component.html
src/app/home-page/home-page.component.scss
```

The custom theme wrapper must import `RouterLink` because the base template uses Angular router links:

```text
src/themes/custom/app/home-page/home-page.component.ts
```

Keep the slider modest in height. It is designed as a homepage header highlight, not a full-screen hero. Check 320px, 390px, 768px, and desktop widths after changing image ratios, text length, or button labels.

## Item PDF Preview

Open-access PDF bitstreams are previewed directly on item pages below the normal file link. The preview appears only when:

- the bitstream format is PDF, either by MIME type `application/pdf` or a `.pdf` filename;
- the current user is authorized for `FeatureID.CanDownload`;
- the bitstream has a content URL.

The preview component is:

```text
src/app/item-page/simple/field-components/file-section/pdf-bitstream-preview/
```

It is used by both item file-section templates:

```text
src/app/item-page/simple/field-components/file-section/file-section.component.html
src/app/item-page/full/field-components/file-section/full-file-section.component.html
```

The simple file-section now always follows the bitstream `format` link so PDF detection works:

```text
src/app/item-page/simple/field-components/file-section/file-section.component.ts
```

The custom theme wrappers must also import `PdfBitstreamPreviewComponent` because they point back to base templates:

```text
src/themes/custom/app/item-page/simple/field-components/file-section/file-section.component.ts
src/themes/custom/app/item-page/full/field-components/file-section/full-file-section.component.ts
```

The preview uses the browser's native PDF rendering in an `iframe`. If a deployment still downloads PDFs instead of displaying them inline, check the DSpace REST/content response headers and proxy behavior, especially `Content-Type: application/pdf` and `Content-Disposition`.

## Responsive Design

Responsive rules are mobile-first in behavior and use these project breakpoints:

| Range | Behavior |
| --- | --- |
| 320px to 480px | Compact logo, search, language, and hamburger controls; mobile navigation and accessibility panel scroll internally |
| 481px to 768px | Larger logo and controls; context help can return while lower-priority controls remain reduced |
| 769px to 1024px | Tablet/small-laptop spacing and medium logo sizing |
| 1025px to 1440px | Standard desktop navigation and full header spacing |
| 1441px and above | Wider logo and controlled maximum content sizes |

The header uses the following CSS rules to prevent horizontal overflow:

- `min-width: 0` on flexible logo and navigation containers.
- `clamp()` for logo width and header height.
- Fixed compact dimensions for search and hamburger buttons on narrow screens.
- Hidden lower-priority toolbar controls on narrow screens.
- Internal vertical scrolling for the mobile navigation menu.

When adjusting the logo, do not change only one theme stylesheet. Update both:

```text
src/themes/custom/app/header/header.component.scss
src/themes/dspace/app/header/header.component.scss
```

The mobile menu wrapper is controlled separately in:

```text
src/themes/dspace/app/header-nav-wrapper/header-navbar-wrapper.component.scss
```

## Sitewide Accessibility Widget

The global widget is mounted once in the application shell:

```text
src/app/app.component.html
src/app/app.component.ts
```

Its implementation is:

```text
src/app/accessibility/sitewide-accessibility/sitewide-accessibility.component.ts
src/app/accessibility/sitewide-accessibility/sitewide-accessibility.component.html
src/app/accessibility/sitewide-accessibility/sitewide-accessibility.component.scss
```

The widget provides:

- Accessibility profiles for epilepsy-safe, seizure-safe, ADHD support, and low vision.
- Font-size changes from 80% to 150%.
- Reading speed and browser text-to-speech voice selection.
- Start, replay, and stop page reading controls.
- Title and link highlighting.
- Dyslexia-friendly font fallback.
- Letter spacing, line height, font weight, and left alignment controls.
- Dark, light, high-contrast, high-saturation, low-saturation, and monochrome modes.
- Reading guide, animation pause, large cursor, and keyboard focus highlighting.
- Interface language selection from active DSpace locales.
- Persistent settings in browser storage and reset-all behavior.

The global effects are applied through classes on the document root and are defined in:

```text
src/styles/_global-styles.scss
```

The widget itself remains above repository filters so the controls do not become unusable when a contrast or saturation mode is active.

The existing DSpace accessibility settings page is separate and should remain synchronized when changing timeout or live-region behavior:

```text
src/app/accessibility/accessibility-settings.service.ts
src/app/info/accessibility-settings/
```

### Accessibility Preference Model

The widget stores preferences under `ucu-sitewide-accessibility-v1` in browser storage. It applies state to the document root through classes such as `ucu-a11y-highlight-titles`, `ucu-a11y-highlight-links`, `ucu-a11y-dyslexia-font`, `ucu-a11y-letter-spacing`, `ucu-a11y-line-height`, `ucu-a11y-font-weight`, `ucu-a11y-align-left`, `ucu-a11y-stop-animations`, `ucu-a11y-big-cursor`, `ucu-a11y-focus-highlight`, `ucu-a11y-dark`, `ucu-a11y-light`, `ucu-a11y-high`, `ucu-a11y-high-saturation`, `ucu-a11y-low-saturation`, and `ucu-a11y-monochrome`.

Font size is stored as `--ucu-a11y-font-size` and ranges from 80% to 150%. Reading uses the browser Web Speech API, so the selected voice must always have a browser-default fallback.

When changing the widget, preserve real buttons, `aria-pressed` state for toggles, the CDK focus trap, the `aria-live` status region, Escape-to-close behavior, and visible `:focus-visible` styling. Test at 320px wide before increasing panel dimensions or grid columns.

## Cookie Consent

Cookie consent is provided by Orejime and initialized through:

```text
src/app/core/cookies/browser-orejime.service.ts
src/app/core/cookies/orejime-configuration.ts
src/app/core/cookies/server-orejime.service.ts
src/app/core/cookies/orejime.service.ts
```

The feature is enabled through `enableCookieConsentPopup` in `src/config/default-app-config.ts`. The footer exposes the settings action when this option is enabled. Consent translations are maintained in `src/assets/i18n/en.json5` and the active locale files.

Orejime renders outside normal Angular component style encapsulation, so its UCU presentation is intentionally maintained in:

```text
src/styles/_global-styles.scss
```

The current consent presentation includes:

- UCU blue borders and primary actions.
- UCU maroon for accent emphasis and consent toggles.
- UCU yellow hover and keyboard-focus treatment.
- White surfaces with dark blue text instead of Orejime's default dark-gray theme.
- Trebuchet MS inherited from the UCU theme font configuration.
- Responsive full-width behavior on small screens.
- Focus-visible outlines for buttons, links, switches, and the close control.

Do not edit Orejime under `node_modules`. Authenticated consent settings are synchronized by `BrowserOrejimeService` into the DSpace user metadata field `dspace.agreements.cookies`. Anonymous and user-specific browser storage use the `orejime-anonymous` and `orejime-<uuid>` naming patterns.

## UCU Design System

The shared UCU tokens are declared in:

```text
src/themes/custom/styles/_theme_css_variable_overrides.scss
src/themes/custom/styles/_theme_sass_variable_overrides.scss
```

| Token | Value | Use |
| --- | --- | --- |
| `--ucu-blue` | `#0B3D91` | Primary navigation, buttons, links, and brand framing |
| `--ucu-maroon` | `#D7014D` | Accents, hover states, and active states |
| `--ucu-yellow` | `#FFD932` | Warning and keyboard-focus emphasis |
| `--ucu-green` | `#007931` | Success states and DSpace semantic feedback |

The custom theme sets `$font-family-sans-serif` to Trebuchet MS followed by operating-system fallbacks. Use the existing tokens and Bootstrap variables instead of introducing a second palette in a component stylesheet.

Shared behavior belongs in `src/styles/_global-styles.scss`. Use a component or theme stylesheet for layout that belongs to one view. Never edit `dist/` or generated CSS directly.

## UI and UX Rules

- Icon-only links must retain `aria-label` and `title` text.
- External social links must retain `target="_blank"` and `rel="noopener noreferrer"`.
- Logos need meaningful alternative text unless they are decorative.
- Buttons need stable dimensions at mobile widths so labels and icons do not shift surrounding controls.
- The accessibility launcher must remain reachable when color filters are active.
- Cookie notice and modal content must remain readable with browser zoom and accessibility font-size changes.
- Prefer existing DSpace and Bootstrap component patterns over new parallel abstractions.

## Branding Assets

### Logos

Replace the main wide logo in:

```text
src/assets/images/ucu-logo-lib.png
```

The compact logo asset is:

```text
src/assets/images/ucu-logo-mini.png
```

The authenticated admin sidebar intentionally uses the UCU crest favicon rather than the wide Libraries and Archives logo:

```text
src/app/admin/admin-sidebar/admin-sidebar.component.html
src/assets/images/favicon.png
```

After replacing either file, check all references with:

```powershell
rg -n "ucu-logo-lib|ucu-logo-mini" src config
```

Use a transparent PNG with a stable aspect ratio. Avoid changing markup dimensions to compensate for a differently cropped image; update the relevant responsive CSS instead.

### Favicons

The active favicon set is:

```text
src/assets/custom/images/favicons/favicon.png
src/assets/custom/images/favicons/favicon2.png
src/assets/custom/images/favicons/apple-touch-icon.png
src/assets/custom/images/favicons/manifest.webmanifest
```

The admin sidebar uses:

```text
src/assets/images/favicon.png
```

When replacing favicons, update the image files and verify the head-tag references in `config/config.yml` and `src/config/default-app-config.ts`.

## SEO, SSR, Robots, and Sitemap

The global document head is maintained in:

```text
src/index.html
```

It contains the repository title, canonical URL, description, robots directives, Dublin Core metadata, citation metadata, Open Graph metadata, Twitter metadata, geographic metadata, and JSON-LD structured data.

Theme-specific head tags and runtime SEO values are maintained in:

```text
config/config.yml
src/config/default-app-config.ts
```

The production repository URL must be consistent in all relevant locations:

```text
https://ucudir.ucu.ac.ug
```

Robots generation is handled by:

```text
src/robots.txt.ejs
```

The generated sitemap and robots origin depend on the runtime `baseUrl` and correct reverse-proxy forwarding headers. The proxy should pass the public `Host`, `X-Forwarded-Host`, `X-Forwarded-Proto`, and related headers so generated links do not contain `localhost`.

The SEO metadata improves discoverability but does not guarantee Google Scholar inclusion. Item-level indexing also depends on public DSpace item pages, complete backend metadata, valid URLs, sitemap availability, and SSR.

SSR is controlled by:

```text
config/config.yml
src/environments/environment.ts
src/environments/environment.production.ts
```

Use the production SSR build before deployment:

```powershell
npm run build:prod
npm run start:prod
```

## Language and Content Text

English UI labels are in:

```text
src/assets/i18n/en.json5
```

The repository community heading and privacy-page labels are maintained there. The repository currently exposes active DSpace locales through `src/config/default-app-config.ts`; Kiswahili is available through `src/assets/i18n/sw.json5`.

When adding a visible label:

1. Add the translation key to `en.json5`.
2. Add translations to active locale files where available.
3. Use the translation pipe in templates instead of hardcoded user-facing text.
4. Run the i18n synchronization or build checks used by the repository.

## Privacy Policy

The rendered privacy policy content is maintained in:

```text
src/app/info/privacy/privacy-content/privacy-content.component.html
```

Its page labels and title are in:

```text
src/assets/i18n/en.json5
```

Update the visible “Last updated” date whenever the approved institutional policy changes. The policy text should be reviewed and approved by UCU before deployment; frontend maintenance alone is not legal approval.

## Repository Information Pages

Custom UCU repository guidance and policy-style pages live under the Angular `info` module. Each page has three layers:

1. A base standalone component and content component in `src/app/info/<page>/`.
2. A themed wrapper in `src/themes/custom/app/info/<page>/<page>.component.ts`.
3. A route entry in `src/app/info/info-routes.ts` using a path constant from `src/app/core/router/info-routing-paths.ts`.

Current custom information pages:

| Public route | Purpose | Base source | Theme wrapper |
| --- | --- | --- | --- |
| `/info/deposit` | How to deposit repository content | `src/app/info/deposit/` | `src/themes/custom/app/info/deposit/` |
| `/info/data` | Data discovery, reuse, licensing, and citation guidance | `src/app/info/data/` | `src/themes/custom/app/info/data/` |
| `/info/service` | Repository service level and support expectations | `src/app/info/service/` | `src/themes/custom/app/info/service/` |
| `/info/terms` | Repository terms of use | `src/app/info/terms/` | `src/themes/custom/app/info/terms/` |
| `/info/preservation` | Preservation approach and access/dissemination notes | `src/app/info/preservation/` | `src/themes/custom/app/info/preservation/` |
| `/info/notice` | Notice and takedown process | `src/app/info/notice/` | `src/themes/custom/app/info/notice/` |
| `/info/quality` | Quality assurance and curation workflow | `src/app/info/quality/` | `src/themes/custom/app/info/quality/` |

### Adding a New Info Page

Use the existing pages as templates. A new page named `example` should normally include:

```text
src/app/info/example/example-content/example-content.component.ts
src/app/info/example/example-content/example-content.component.html
src/app/info/example/example-content/example-content.component.scss
src/app/info/example/example.component.ts
src/app/info/example/example.component.html
src/app/info/example/example.component.scss
src/app/info/example/themed-example.component.ts
src/themes/custom/app/info/example/example.component.ts
```

Then update:

```text
src/app/core/router/info-routing-paths.ts
src/app/info/info-routes.ts
src/app/footer/footer.component.html
src/assets/i18n/en.json5
src/assets/i18n/sw.json5
```

Most current pages reuse the shared info-page presentation from:

```text
src/app/info/service/service-content/service-content.component.scss
```

Reuse that style when the page is another policy/guidance page. Create a separate stylesheet only when the page needs a genuinely different layout.

### Content Adaptation Rules

Several repository policy pages were adapted from Cambridge Apollo-style reference material. Do not paste external institutional content directly. When updating these pages:

- Replace `Apollo`, `University of Cambridge`, `Cambridge University Library`, Cambridge addresses, and Cambridge emails with UCU-specific wording.
- Prefer `Uganda Christian University Digital Institutional Repository` on first mention and `the repository` afterwards.
- Use internal links such as `/info/deposit`, `/info/data`, `/info/privacy`, `/info/notice`, `/info/quality`, and `/info/feedback`.
- Do not invent legal contact details, DOIs, policy identifiers, or office addresses unless UCU has approved them.
- Route contact prompts to the repository feedback form unless an approved UCU repository email is supplied.
- Keep policy wording practical and institutional, but avoid claiming a service level, DOI workflow, preservation system, or takedown authority that UCU has not approved operationally.

### Info Page Translation Keys

Each page needs at least:

```text
info.<page>.breadcrumbs
info.<page>.title
footer.link.<page>
```

The current custom keys include:

```text
info.deposit.*
info.data.*
info.service.*
info.terms.*
info.preservation.*
info.notice.*
info.quality.*
footer.link.deposit
footer.link.data
footer.link.service
footer.link.terms
footer.link.preservation
footer.link.notice
footer.link.quality
```

Add English first in `src/assets/i18n/en.json5`, then add translated or TODO placeholder entries in active locale files. The current Kiswahili file keeps many English placeholders with TODO comments, so follow that local pattern until approved translations are available.

## Runtime Configuration

The local deployment configuration is:

```text
config/config.yml
```

Important sections include:

- `ui.baseUrl`: public repository URL used for redirects and SEO.
- `ui.host` and `ui.port`: local server binding.
- `rest`: DSpace backend REST API connection.
- `themes`: active UCU theme and favicon head tags.
- `ssr`: server-side rendering behavior.

Do not put deployment secrets in this repository. Use the deployment environment or a protected configuration file for credentials and private endpoints.

## Verification and Troubleshooting

Run these checks after a customization:

```powershell
git diff --check
npm run build -- --progress=false
```

For a production-like SSR check:

```powershell
npm run build:prod
npm run start:prod
```

Inspect at minimum: `320x800`, `390x844`, `768x1024`, `1024x768`, `1366x768`, and `1920x1080`. Check keyboard navigation through the header, hamburger menu, accessibility widget, and cookie controls. Also verify favicon loading, canonical URL, robots output, sitemap origin, language switching, external social links, and the latest-items sort order.

### Common Problems

**Branding is not visible:** confirm `ucu-branding` is active in `config/config.yml`, rebuild, and clear cached theme assets. Search references with:

```powershell
rg -n "ucu-logo|favicon|ucu-blue|ucu-maroon|Trebuchet" src config angular.json
```

**Cookie consent still looks dark or green:** confirm `src/styles/_global-styles.scss` is in the global styles bundle and clear the Orejime consent cookie before retesting.

**Robots or sitemap contains localhost:** check `ui.baseUrl` and reverse-proxy `X-Forwarded-Host` and `X-Forwarded-Proto` headers, then inspect generated output from the public hostname.

**Latest additions are not current:** confirm both header templates still use `dc.date.accessioned` with `DESC`. This link sorts search results; it does not reindex the backend or bypass caching.

**Accessibility changes affect only one page:** confirm the preference class is applied to `html` and that global selectors target `ds-root`. Sitewide effects belong in `src/styles/_global-styles.scss`.

**New info page gives a blank page or build error:** confirm the themed wrapper import path in `themed-<page>.component.ts`, the custom wrapper path in `src/themes/custom/app/info/<page>/`, and the route import in `src/app/info/info-routes.ts`. Standalone components must list imported components, directives, and `RouterLink` where templates use Angular links.

**Footer links are cramped or underlined:** confirm `.footer-info` still uses `flex-wrap: wrap` and that footer anchors use `text-decoration: none` in `src/app/footer/footer.component.scss`.

## Files Generated by Build or Runtime Scripts

Do not hand-edit these generated outputs:

```text
dist/
src/assets/config.json
src/decorator-registries/
angular.json baseHref changes generated by scripts/base-href.ts
```

Change the source configuration or source component instead, then regenerate the output through the normal build or serve command.

## Verification Checklist

Before committing a theme change:

```powershell
git diff --check
npm run build -- --progress=false
```

For a production deployment:

```powershell
npm run build:prod
npm run start:prod
```

Manually check at minimum:

- 320x800 and 390x844 phone widths.
- 768x1024 tablet portrait.
- 1024x768 tablet landscape.
- 1366x768 desktop.
- 1920x1080 widescreen.
- Keyboard-only navigation through the header, hamburger menu, and accessibility widget.
- The latest-items link returns page one sorted by `dc.date.accessioned` descending.
- Logo, favicon, canonical URL, robots, sitemap, and SSR use the production repository origin.
- No text or controls overflow horizontally.

## Safe Change Workflow

1. Confirm the active theme in `config/config.yml`.
2. Find the feature in the Feature-to-File Map above.
3. Edit source files, not `dist` or generated runtime files.
4. Keep custom and DSpace fallback header files synchronized.
5. Run `git diff --check` and the development build.
6. Test the relevant responsive widths and keyboard flow.
7. Run the production SSR build before deployment.
8. Review the final diff for unrelated changes before committing or pushing.
