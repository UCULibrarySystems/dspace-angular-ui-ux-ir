# Institutional Repository UI/UX Customisation Guide

This document records the UI/UX customisations that should be preserved whenever the Uganda Christian University Institutional Repository frontend is updated, reinstalled, rebased, or redeployed.

The goal is to keep the DSpace Angular application visually and textually aligned with Uganda Christian University Libraries and Archives while preserving the standard repository functionality, especially login, search, navigation, submission, browsing, and administration workflows.

## Brand Identity

Use the Uganda Christian University Libraries and Archives identity throughout the public interface.

Primary institution name:

```text
Uganda Christian University Libraries and Archives
```

Repository identity:

```text
Uganda Christian University Institutional Repository
```

Avoid user-facing DSpace branding in logos, titles, default homepage content, footer text, and favicons. DSpace may remain in technical code names, package names, class names, internal comments, and upstream framework references where changing it would be unsafe or misleading.

## UCU Colour Palette

Use the UCU digital colour codes consistently:

| Colour | RGB | Hex | Usage |
| --- | --- | --- | --- |
| Blue | 11, 61, 145 | `#0B3D91` | Main colour, header utility bar, primary buttons, navbar, links |
| Maroon/Red | 215, 1, 77 | `#D7014D` | Secondary brand colour, accents, footer border, hover states |
| Yellow | 255, 217, 50 | `#FFD932` | Call-to-action highlights, hover accents |
| Green | 0, 121, 49 | `#007931` | Success state and supporting institutional accent |

Primary rule:

```text
Blue is the main colour. Maroon is the second main colour.
```

Use yellow sparingly for emphasis, especially on call-to-action buttons such as Apply Now. Use green for success states and subtle supporting accents.

## Typography

The default UI font must be:

```css
"Trebuchet MS"
```

The theme Sass variable should keep this font first:

```scss
$font-family-sans-serif: "Trebuchet MS", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

Also enforce it in the DSpace theme global stylesheet:

```scss
body {
  font-family: "Trebuchet MS", var(--bs-font-sans-serif);
}
```

## Core Files To Preserve

The main UI/UX customisations currently live in these files:

```text
src/index.html
src/assets/i18n/en.json5
src/themes/custom/assets/i18n/en.json5
src/config/default-app-config.ts
src/app/footer/footer.component.html
src/app/footer/footer.component.scss
src/app/header/header.component.html
src/app/login-page/login-page.component.html
src/app/logout-page/logout-page.component.html
src/app/shared/theme-support/theme.service.ts
src/themes/dspace/styles/_theme_sass_variable_overrides.scss
src/themes/dspace/styles/_theme_css_variable_overrides.scss
src/themes/dspace/styles/_global-styles.scss
src/themes/dspace/app/header/header.component.html
src/themes/dspace/app/header/header.component.scss
src/themes/dspace/app/navbar/navbar.component.scss
src/themes/dspace/app/home-page/home-news/home-news.component.html
src/themes/dspace/app/home-page/home-news/home-news.component.scss
```

Brand assets currently live in:

```text
src/assets/images/ucu-logo-lib.png
src/assets/images/ucu-logo-mini.png
src/assets/images/favicon.png
src/themes/dspace/assets/images/favicons/android-chrome-192x192.jpg
src/themes/dspace/assets/images/favicons/android-chrome-512x512.png
src/themes/dspace/assets/images/favicons/apple-touch-icon.png
src/themes/dspace/assets/images/favicons/favicon.png
src/themes/dspace/assets/images/favicons/favicon2.png
src/themes/dspace/assets/images/favicons/manifest.webmanifest
```

Homepage slider images currently live in:

```text
src/themes/dspace/assets/images/banner.jpg
src/themes/dspace/assets/images/banner-half.jpg
src/themes/dspace/assets/images/banner-tall.jpg
src/themes/dspace/assets/images/banner.webp
src/themes/dspace/assets/images/banner-half.webp
src/themes/dspace/assets/images/banner-tall.webp
```

## Logo And Favicon Rules

Replace DSpace logos and icons with UCU assets.

Header logo:

```text
assets/images/ucu-logo-lib.png
```

Compact/admin/sidebar logo:

```text
assets/images/ucu-logo-mini.png
```

Fallback favicon:

```text
assets/images/favicon.png
```

Theme favicons:

```text
assets/dspace/images/favicons/favicon.png
assets/dspace/images/favicons/favicon2.png
assets/dspace/images/favicons/apple-touch-icon.png
assets/dspace/images/favicons/android-chrome-192x192.jpg
assets/dspace/images/favicons/android-chrome-512x512.png
```

The web manifest should use:

```json
{
  "name": "UCU Libraries and Archives",
  "short_name": "UCU"
}
```

Do not restore these old DSpace assets unless they are needed only as non-logo banner imagery:

```text
dspace-logo.svg
dspace-logo-mini.svg
dspace-logo-old.png
qa-DSpaceUsers-logo.png
favicon.ico
favicon.svg
```

## Header Requirements

The header must visually match the UCU website pattern while preserving the DSpace Angular layout and login location.

Always preserve these functional components:

```html
<ds-navbar></ds-navbar>
<ds-search-navbar></ds-search-navbar>
<ds-lang-switch></ds-lang-switch>
<ds-context-help-toggle></ds-context-help-toggle>
<ds-impersonate-navbar></ds-impersonate-navbar>
<ds-auth-nav-menu></ds-auth-nav-menu>
```

Do not move the login/auth component out of the existing header-right toolbar area unless the repository workflow is deliberately redesigned.

The header should include:

1. A blue UCU utility strip at the top.
2. A recent updates link.
3. Quick links styled as pill buttons.
4. A white main header row.
5. The UCU Libraries and Archives logo on the left.
6. Search and login controls on the right.
7. An Apply Now yellow call-to-action button on desktop.
8. A mobile menu toggle that keeps the existing mobile navbar behaviour.

Recommended utility links:

```text
Check for recent website updates
List of All Programmes
Webmail
Students Mail
Alpha
Careers
e-Learning
Research at UCU
UIS
```

Header styling rules:

```text
Top bar background: #0B3D91
Main header background: #FFFFFF
Primary interactive border/text: #0B3D91
Secondary hover/accent: #D7014D
Apply Now background: #FFD932
```

Keep the header responsive. On smaller screens, hide nonessential utility links and keep search/menu/login usable.

## Navbar Requirements

The repository navbar must retain its existing DSpace menu structure and routing.

Style the desktop navbar items as UCU-blue pill buttons while preserving dropdown behaviour. Hover states should remain readable and should use maroon or a darker blue.

Do not hard-code repository routes into the header when DSpace already provides them through menu components. Use the existing menu system unless there is a specific content requirement.

## Homepage Slider Requirement

The homepage banner image should be restored and displayed as a slider, but at about half the original visual height.

Current implementation:

```text
src/themes/dspace/app/home-page/home-news/home-news.component.html
src/themes/dspace/app/home-page/home-news/home-news.component.scss
```

The slider should:

1. Use a shorter banner area.
2. Rotate between available banner images and the UCU logo.
3. Use CSS animation where possible.
4. Avoid breaking the existing metadata-driven homepage news block.
5. Keep text readable using a blue translucent overlay.

Recommended minimum heights:

```scss
desktop: 260px
mobile: 210px
```

If repository administrators configure homepage/footer metadata from the backend, keep that override path working. The default themed content should only render when no backend metadata value exists.

## Homepage Text

Default homepage text should identify the repository as UCU, not DSpace.

Recommended heading:

```text
UCU Libraries and Archives
```

Recommended lead:

```text
Uganda Christian University Institutional Repository preserves and shares scholarly, archival, and research outputs.
```

Recommended support text:

```text
Browse, discover, and access university knowledge from the UCU community.
```

Remove demo/sandbox language from the visible homepage, including default test account references.

## Footer Requirements

The footer must identify the institution and explain publication licensing clearly.

Footer name:

```text
Uganda Christian University Libraries and Archives
```

Copyright format:

```text
Uganda Christian University Libraries and Archives © {{ year }}
```

License notice:

```text
Repository metadata and site content are distributed under the Creative Commons Attribution (CC BY) license; authors retain ownership of copyright and licensing rights for their publications.
```

Footer styling:

```text
Background: #0B3D91
Top border/accent: #D7014D
Hover accent: #FFD932
Text: white or near-white
```

Footer links such as accessibility, privacy policy, end-user agreement, cookie settings, and feedback should remain visible and functional.

Remove visible DSpace and LYRASIS footer branding links from the public footer unless there is a policy requirement to show software attribution elsewhere.

## Text And Translation Keys

Important English translation keys to preserve:

```json5
"repository.title": "UCU Libraries and Archives"
"repository.title.prefix": "UCU Libraries and Archives :: "
"menu.section.browse_global": "Browse Repository"
"footer.ucu.name": "Uganda Christian University Libraries and Archives"
"footer.ucu.license": "Repository metadata and site content are distributed under the Creative Commons Attribution (CC BY) license; authors retain ownership of copyright and licensing rights for their publications."
```

Search for remaining user-facing DSpace strings after each update:

```powershell
rg -n "DSpace|dspace-logo|favicon\\.svg|favicon\\.ico|qa-DSpaceUsers-logo|DSpace Sandbox|DSpace 9" src
```

Not every result should be changed. Internal class names, imports, package names, comments, and upstream technical identifiers can remain.

## Login And Authentication Requirements

Preserve login placement in the header. The auth menu is part of the standard DSpace Angular workflow and should continue to be rendered through:

```html
<ds-auth-nav-menu></ds-auth-nav-menu>
```

Login and logout pages should use:

```text
assets/images/ucu-logo-lib.png
```

Files:

```text
src/app/login-page/login-page.component.html
src/app/logout-page/logout-page.component.html
```

Do not remove impersonation or context-help controls unless administrators explicitly request it.

## Dependency Maintenance Notes

Dependency upgrades should be handled conservatively because this DSpace Angular version has a mixed Angular and Mirador stack.

Verified safe maintenance work already done:

```text
Angular 20 patch packages updated to 20.3.27
Angular CLI/build tooling updated to 20.3.32
PostCSS, Sass, Cypress, ng-mocks, js-yaml, isbot, lru-cache, express-rate-limit, and TypeScript ESLint packages patched
@popperjs/core added for ng-bootstrap
Webpack kept at 5.107.2 because 5.109.2 broke Angular loader parsing
```

Known major migration areas:

```text
mirador 3 -> 4
mirador-dl-plugin 0.x -> 1.x
mirador-share-plugin 0.x -> 1.x
Material UI v4 replacement through Mirador migration
react-beautiful-dnd deprecation through Mirador migration
Angular animation API migration away from deprecated @angular/animations usage
@angular-builders/custom-webpack major upgrade
@cypress/schematic major upgrade
compression-webpack-plugin major upgrade
```

Do not run:

```powershell
npm audit fix --force
```

unless a separate migration branch is planned and there is time to test Mirador, media viewers, Angular builds, SSR builds, Cypress, and repository browsing.

Use Node 20 or Node 22 for this project. The declared engine is:

```json
"node": ">=20.0.0 <25.0.0"
```

Node 26 may install and build, but it is outside the supported project range.

## Verification Checklist

Run these checks after UI/UX or dependency changes:

```powershell
npm run build:lint
```

```powershell
$env:NODE_OPTIONS='--max_old_space_size=4096'
npm run build -- --progress=false
```

Optional audit check:

```powershell
npm audit
```

Branding search:

```powershell
rg -n "dspace-logo|qa-DSpaceUsers-logo|favicon\\.svg|favicon\\.ico|DSpace Sandbox|DSpace 9" src
```

Manual browser checks:

1. Header logo renders correctly.
2. Header utility bar is blue.
3. Search button is visible and opens search input.
4. Login remains in the expected location.
5. Mobile navbar opens and closes.
6. Homepage slider displays and is not too tall.
7. Footer shows UCU Libraries and Archives.
8. Footer licensing text is readable.
9. Favicons display in browser tabs and installed app metadata.
10. Admin sidebar uses the UCU crest, not the old DSpace mini logo.

## Git And GitHub Notes

Local commits may succeed even when GitHub push fails.

Current configured GitHub remote:

```text
origin https://github.com/UCULibrarySystems/dspace-angular-ui-ux-ir.git
```

If pushing fails with:

```text
Permission to UCULibrarySystems/dspace-angular-ui-ux-ir.git denied to artisgrit.
```

then the machine is authenticated as `artisgrit`, which does not have write access to the repository. Fix by authenticating with a GitHub account that has write access to `UCULibrarySystems/dspace-angular-ui-ux-ir`, or grant `artisgrit` permission.

Before committing:

```powershell
git status --short --branch
git diff --stat
```

Recommended commit messages:

```text
Replace DSpace branding with UCU assets
Apply UCU header branding and slider
Update footer branding and license notice
Update maintained dependency patches
Document institutional repository UI customisations
```

## Rebase Or Upgrade Checklist

When pulling upstream DSpace Angular changes or upgrading to a new DSpace release, reapply and verify:

1. UCU logo assets.
2. Favicons and manifest.
3. `src/index.html` title.
4. Theme Sass colour variables.
5. Theme CSS custom properties.
6. Trebuchet MS font.
7. Header utility bar.
8. Header right-side login/search layout.
9. Navbar blue pill styling.
10. Homepage shorter slider.
11. Homepage UCU default text.
12. Login/logout page logos.
13. Admin sidebar logo.
14. Footer UCU name and CC BY/publication ownership notice.
15. English translation overrides.
16. Build and lint checks.

Treat this document as the baseline acceptance checklist for future Institutional Repository UI/UX customisation work.
