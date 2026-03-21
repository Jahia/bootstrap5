# SysOp Guide — System Administrators

This guide covers installation, upgrades, troubleshooting, and operational considerations for Bootstrap 5 on Jahia.

---

## Requirements

| Requirement | Version |
|---|---|
| Jahia | 8.2.0.0 or higher (since v2.4.0) |
| Java | As required by your Jahia installation |
| Node.js | v18.20.4 (only needed if building from source) |

> For Jahia 8.0.x, use Bootstrap 5 version **2.3.x**. For Jahia 7.3.x, use the **1.x.x** series.

---

## Installation

### Option A — Jahia Store (recommended)

1. Log in to Jahia Administration
2. Go to **Administration → Modules and Extensions → Modules**
3. Click **Available modules** and search for **Bootstrap 5 package**
4. Click **Install**

The package installs all required modules in the correct order.

### Option B — Manual installation from GitHub

Download the latest release JARs from [GitHub Releases](https://github.com/Jahia/bootstrap5/releases/latest).

Install modules **in this order** (each depends on the previous):

1. `bootstrap5-core-{version}.jar`
2. `bootstrap5-components-{version}.jar`
3. *(optional)* `bootstrap5-templates-starter-{version}.jar`

To install a module manually:
1. Go to **Administration → Modules and Extensions → Modules**
2. Click **Upload a module**
3. Select the JAR file and confirm

### Option C — Build from source

```bash
git clone https://github.com/Jahia/bootstrap5.git
cd bootstrap5
mvn clean package
```

Then install the generated JARs from `bootstrap5-core/target/` and `bootstrap5-components/target/`.

> **Note:** The build requires internet access on first run — Node.js v18 and the Bootstrap npm package are downloaded automatically by the `frontend-maven-plugin`.

---

## Enabling the module on a site

After installation, enable the module on each site that should use Bootstrap 5 components:

1. Go to **Administration → Sites → [your site] → Modules**
2. Find **bootstrap5-components** and click **Enable**

---

## Module dependencies

```
bootstrap5-components
    └── bootstrap5-core
            └── default (Jahia built-in)
```

Bootstrap 5 has **no external third-party dependencies** at runtime. All Bootstrap CSS and JS assets are bundled inside `bootstrap5-core`.

---

## Asset mapping (v2.2.0+)

Since v2.2.0, `bootstrap5-core` no longer provides automatic mappings for uncompressed asset names. If third-party modules reference the old asset names, add this mapping in a Spring XML file in your project:

```xml
<bean class="org.jahia.services.render.StaticAssetMapping">
    <property name="mapping">
        <map>
            <entry key="bootstrap.css"    value="bootstrap.min.css"/>
            <entry key="bootstrap.js"     value="bootstrap.bundle.min.js"/>
            <entry key="bootstrap.min.js" value="bootstrap.bundle.min.js"/>
            <entry key="popper.js"        value="bootstrap.bundle.min.js"/>
            <entry key="popper.min.js"    value="bootstrap.bundle.min.js"/>
        </map>
    </property>
</bean>
```

---

## Upgrading

### General procedure

1. Download the new version JARs from [GitHub Releases](https://github.com/Jahia/bootstrap5/releases)
2. Install them via **Administration → Modules → Upload a module** (in order: core first, then components)
3. Jahia will hot-reload the modules without a full server restart

### Version-specific migration notes

**Upgrading to 2.4.0+ (from 2.3.x)**

- Requires Jahia **8.2.0.0** or higher. Verify your Jahia version before upgrading.
- All Spring Framework dependencies have been removed. If your custom code depended on Spring beans from this module, review for compatibility.
- Two new navbar properties (`liClass`, `navLinkClass`) are added with default values — no content migration needed.

**Upgrading to 2.2.0+ (from 2.1.x)**

- Asset mappings for uncompressed Bootstrap files are removed. Check all custom templates and third-party modules for references to `bootstrap.css`, `bootstrap.js`, or `popper.js` and update them, or add the Spring mapping bean described above.

---

## Site-level branding

You can define a site-wide navbar brand (logo and text) that applies to all navbar instances without requiring per-component configuration:

1. Go to **Administration → Sites → [your site] → Mixins**
2. Add the `bootstrap5mix:siteBrand` mixin
3. Set `brandText`, `brandImage`, and/or `brandImageMobile`

> **Important:** When `bootstrap5mix:siteBrand` is present on the site node, it takes **full priority** over any brand set directly on a navbar component. To use per-navbar branding instead, remove this mixin from the site.

---

## Troubleshooting

### Bootstrap styles are not applied

- Confirm `bootstrap5-components` is **enabled** on the site (not just installed)
- Confirm the page template includes `<template:addResources type="css" resources="bootstrap.min.css"/>`
- In a browser, open DevTools → Network and check that `/modules/bootstrap5-core/css/bootstrap.min.css` loads (HTTP 200)

### Dropdowns overflow off-screen in the navbar

The navbar is likely not inside a Bootstrap container. In the navbar component settings, enable **Global Settings → Wrap the navbar in a container**.

### Brand image not displaying on the navbar

Two possible causes:
1. **Typo in property**: fixed in v2.4.4 — upgrade if on an earlier version
2. **Site-level brand takes priority**: check Administration → Site settings → Mixins for a `bootstrap5mix:siteBrand`. If present, it overrides all component-level brand settings.

### Language switcher shows broken HTML

Fixed in v2.4.4. Upgrade to the latest version.

### Login "remember me" not working

Fixed in v2.2.2. Upgrade to v2.2.2 or later.

### Module fails to start after upgrade

1. Check the Jahia server logs for OSGi bundle errors
2. Verify the `bootstrap5-core` module started successfully before `bootstrap5-components`
3. Ensure the Jahia version meets the minimum requirement for the installed Bootstrap 5 version

### CKEditor toolbar missing buttons

If the "Remove Format" or "Wash" buttons are missing, check that you are on v2.4.0 or later and that the CKEditor configuration file is being loaded correctly (`$context/modules/bootstrap5-components/javascript/ckconfig.js`).

---

## Security

To report security vulnerabilities, contact: **support@jahia.com**

Do not open public GitHub issues for security-related findings.

---

[← Back to README](../README.md)
