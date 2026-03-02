# React External Example

Standalone React app for external use, without monorepo dependencies.

## Features
- React 19
- Vite
- Tailwind CSS
- PostCSS w/postcss-prefix-selector to scope styles
- Local type definitions

## Supported Blades
- Marquee
- Text
- Nup (with cards: Resource, Headshot, Quote, Statistic)

## Open Blade Properties

### Dev (draft pull request)

Style: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/dev/react-external/v0.1.0/style.css
Script: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/dev/react-external/v0.1.0/react-external.umd.cjs
html: <div id="react-external" class="react-external__wrapper"></div>

### Stage (pull request ready)

Style: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/staging/react-external/v0.1.0/style.css
Script: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/staging/react-external/v0.1.0/react-external.umd.cjs
html: <div id="react-external" class="react-external__wrapper"></div>

### Production (main branch)

Style: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/react-external/v0.1.0/style.css
Script: https://a.sfdcstatic.com/digital/@sfdc-www/open-blade-libs/react-external/v0.1.0/react-external.umd.cjs
html: <div id="react-external" class="react-external__wrapper"></div>

## Getting started with Page Builder JSON in local dev.

#### Steps
- Build out the page with Page Builder blades
- Stage content
- Copy the page's wpdata json to public/page.json
