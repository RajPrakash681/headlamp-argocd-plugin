# Argo CD Headlamp Plugin demo

A [Headlamp](https://headlamp.dev) plugin that integrates [Argo CD](https://argo-cd.readthedocs.io) GitOps into the Headlamp Kubernetes UI.


---

## What This Plugin Does

Argo CD manages Kubernetes deployments via Git, but checking sync status, health, and deployment state requires switching to a separate UI. This plugin brings that information directly into Headlamp so SREs and developers can answer operational questions without leaving the Kubernetes dashboard.

### Features

- **Applications List** — View all Argo CD Applications on the cluster with sync status, health, source repository, revision, destination namespace, and last synced time
- **Application Details** — Full detail page with Status, Source, Destination, Managed Resources table, and Conditions
- **App Projects List** — View all AppProjects with source repos count, destinations, and roles count
- **App Project Details** — Source repositories, destinations table, roles accordion, and a live list of Applications belonging to the project
- **Headlamp Project Tab** — Injects an "Argo CD" tab into the Headlamp Projects detail view, automatically filtering Applications by the project's namespaces
- **Graceful degradation** — Sidebar entries and tabs are hidden automatically on clusters where Argo CD is not installed



## Tech Stack

- TypeScript (strict mode)
- React
- Headlamp Plugin API (`@kinvolk/headlamp-plugin`)
- MUI (Material UI) components
- Iconify icons
- Argo CD CRDs: `Application` and `AppProject` in `argoproj.io/v1alpha1`

---

## Project Structure

```
src/
├── index.tsx                     # Plugin entry: all register* calls
├── types.ts                      # TypeScript interfaces for Argo CD CRD spec/status
├── resources.ts                  # makeCustomResourceClass definitions and typed accessors
└── components/
    ├── StatusChip.tsx            # Reusable SyncChip and HealthChip components
    ├── ApplicationList.tsx       # Applications list page
    ├── ApplicationDetails.tsx    # Application detail page
    ├── AppProjectList.tsx        # App Projects list page
    ├── AppProjectDetails.tsx     # App Project detail page
    └── ProjectArgoCDTab.tsx      # Tab injected into Headlamp Project detail
```

---

## Prerequisites

- [Headlamp](https://headlamp.dev) running locally
- [Argo CD](https://argo-cd.readthedocs.io/en/stable/getting_started/) installed on your cluster
- Node.js 18+

---

## Getting Started

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Copy dist to Headlamp plugins folder (Linux/Mac)
cp -r dist ~/.config/Headlamp/plugins/argo-cd

# Copy dist to Headlamp plugins folder (Windows)
xcopy /E /I dist %APPDATA%\Headlamp\plugins\argo-cd
```

Then restart Headlamp. The "Argo CD" section will appear in the sidebar.

---

## Development

```bash
# Type check
npm run tsc

# Lint
npm run lint

# Build
npm run build
```

---

## Author

**Raj Prakash**
BITS Pilani, India
[github.com/RajPrakash681](https://github.com/RajPrakash681)
