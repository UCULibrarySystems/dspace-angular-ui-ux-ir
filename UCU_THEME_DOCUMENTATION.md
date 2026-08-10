# UCU Institutional Repository Theme Guide

This document describes the Uganda Christian University (UCU) branding and user-interface customizations in this DSpace Angular repository. It is the maintenance reference for future developers, library staff, and deployment administrators.

The repository is the frontend for the UCU Digital Institutional Repository. The DSpace backend remains a separate application and supplies the REST API, search index, authentication, metadata, and repository records.

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
| Sitewide accessibility launcher and panel | `src/app/accessibility/sitewide-accessibility/` | `src/app/app.component.html`, `src/app/app.component.ts` |
| Accessibility preference effects | `src/styles/_global-styles.scss` | `src/app/accessibility/sitewide-accessibility/sitewide-accessibility.component.scss` |
| Accessibility cursor assets | `src/assets/images/accessibility-cursor.svg` and `accessibility-pointer.svg` | Accessibility global styles |
| Main repository logo | `src/assets/images/ucu-logo-lib.png` | `src/index.html`, runtime head tags |
| Small/sidebar logo | `src/assets/images/ucu-logo-mini.png` | Admin sidebar templates and styles |
| Favicon and app icons | `src/assets/custom/images/favicons/` | `config/config.yml`, `src/config/default-app-config.ts` |
| SEO metadata | `src/index.html` | `src/config/default-app-config.ts`, `config/config.yml` |
| Robots and sitemap origin | `src/robots.txt.ejs` | `config/config.yml`, reverse proxy headers |
| Community heading and interface text | `src/assets/i18n/en.json5` | Other active locale files |
| Privacy policy page | `src/app/info/privacy/privacy-content/privacy-content.component.html` | `src/assets/i18n/en.json5` |
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
- Search, language, authentication, and context controls.
- The mobile hamburger trigger.

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

## Branding Assets

### Logos

Replace the main wide logo in:

```text
src/assets/images/ucu-logo-lib.png
```

The sidebar or compact logo is:

```text
src/assets/images/ucu-logo-mini.png
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

