# StaffSchedulingWeb

StaffSchedulingWeb is the official web interface for the StaffScheduling ecosystem. It supports case management,
preference input, schedule comparison, and final schedule selection for deployment workflows.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## Overview

This application is designed as a companion UI to the solver project:

- Solver and optimization logic: [StaffScheduling](https://github.com/CombiRWTH/StaffScheduling)
- Web workflow and operational UI: this repository

Core capabilities:

- Manage case-specific employee data inputs
- Capture wishes and blocked periods
- Import and compare multiple generated schedules
- Select and export the preferred schedule

## Quick Start

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local configuration:

   - Copy `config.template.json` to `config.json`
   - Set `casesDirectory` to your cases path, for example:

   ```json
   {
     "casesDirectory": "../StaffScheduling/cases"
   }
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Data Layout (Simplified)

```
cases/
└── [case_id]/
    ├── case_information.json
    ├── employees.json
    ├── wishes_and_blocked.json
    ├── schedule_[timestamp].json
    └── schedules.json
```

## New Functionalities and Features

- **Multiple-station planning:** Select a month and several stations together. Employee, wishes,
  weights, and minimum-staffing views support multiple selected cases. Solving submits all selected
  station IDs in one request for joint planning in the backend.
- **Backend API integration:** Available stations are loaded from `/solve/options`. Most data adapters
  now read and write through the Python API instead of the local case files described above.
  The backend address defaults to `http://127.0.0.1:8000` and can be configured with `SOLVER_API_URL`.
- **Asynchronous solve jobs:** Starting a solve returns a job ID immediately. The frontend checks its
  status every 10 seconds and keeps the latest 10 jobs per month and station selection in browser
  storage. The timeout can be set before starting a job; its current frontend default is 60 seconds.
- **Infeasible-result feedback:** A job that finishes without a feasible solution shows
  **Fehlgeschlagen — Keine zulässige Lösung**. Expanding the row explains the result separately from
  an execution error.
- **Extended wishes and staffing:** Wishes now include preferred working days and shifts in addition
  to time off and blocked periods. Minimum staffing also supports **Zwischendienst (Z)** alongside
  Frühdienst, Spätdienst, and Nachtdienst.
- **Schedule comparison and saving:** Comparison selection and its empty state have been improved.
  Each schedule in **Alle Dienstpläne** has an **In TimeOffice speichern** button that sends the full
  plan to `/schedules/write-to-timeoffice`. This requires the backend POST endpoint, which is not
  registered in the currently integrated backend.
- **Availability tools:** Monthly and weekly availability/unavailability can be entered and weekly
  settings converted to a month. These screens remain in the code, but their navigation links are
  currently hidden together with global wishes and templates.
- **Reduced solver UI:** The Solver dropdown currently offers only **Lösen (solve)**. Unused fetch,
  solve-multiple, insert, and delete options are commented out for later restoration. The unused
  **Versteckte Mitarbeiter** weight is also commented out in the display metadata.

## Documentation

This README intentionally stays concise. For full documentation and detailed workflows, see:

- Project docs site: https://julian466.github.io/StaffSchedulingWeb/
- Solver docs: https://combirwth.github.io/StaffScheduling/
- Local docs folder: `docs/`

## Contributing

Contributions and issue reports are welcome through GitHub Issues and Pull Requests.
