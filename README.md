# LeadX --- Real Estate Lead Management CRM

LeadX is a web-based CRM prototype for capturing and managing leads from
real-estate landing pages. It connects a simple HTML/CSS/JavaScript
frontend to a Node.js/Express backend, with Google Sheets used as the
current lead store.

> **Project status:** This README describes the functionality visible in
> the supplied project files. AI lead scoring, sentiment analysis, MySQL
> migration, and marketing automation are future enhancements unless
> separately implemented.

## Features

-   **Lead capture:** Collects lead details such as name, email, phone,
    country code, and source.
-   **Google Sheets integration:** Appends submitted leads to a Google
    Sheet.
-   **Lead listing:** Fetches lead records from Google Sheets.
-   **Lead assignment:** Provides a backend endpoint to assign a lead to
    an employee.
-   **Status updates:** Provides a backend endpoint to update a lead's
    status.
-   **Role-based filtering logic:** The lead-list endpoint returns all
    records for the `owner` role and filters records by assigned user
    for other roles.
-   **Web interface:** Includes landing-page, login, and dashboard
    HTML/CSS/JavaScript files.

## Tech Stack

-   **Frontend:** HTML, CSS, JavaScript
-   **Backend:** Node.js, Express.js
-   **Integration / storage:** Google Sheets API via the `googleapis`
    package
-   **Middleware:** CORS and Express JSON parsing
-   **Development:** Nodemon

## Project Structure

``` text
crm/
├── client/
│   └── crm/
│       ├── index.html       # Lead capture / landing page
│       ├── script.js        # Landing page behavior and submission logic
│       ├── style.css        # Landing page styles
│       ├── login.html       # Login interface
│       ├── login.css        # Login styles
│       ├── dashboard.html   # CRM dashboard
│       └── dashboard.js     # Dashboard behavior
├── server/
│   ├── index.js             # Express server and CRM endpoints
│   └── googleSheets.js      # Google Sheets read/write operations
├── package.json
└── package-lock.json
```

Do not commit `server/credentials.json`; it contains Google
service-account credentials and must be supplied privately on each
development machine or deployment environment.

## Requirements

-   Node.js and npm installed
-   A Google Cloud project with the Google Sheets API enabled
-   A Google service account with access to the spreadsheet
-   A Google Sheet with a tab named `Sheet1` and columns matching the
    data used by the application

## Run Locally

### 1. Get the project

Clone your repository, or download the project and open the `crm` folder
in VS Code.

``` bash
cd crm
```

### 2. Install dependencies

``` bash
npm install
```

### 3. Configure Google Sheets credentials

1.  Enable the **Google Sheets API** in Google Cloud.
2.  Create a service account and generate a JSON key.
3.  Share the target spreadsheet with the service account's email
    address, granting the access it needs to read and edit the sheet.
4.  Store the JSON key securely. The current code expects it at
    `server/credentials.json` when commands are run from the `crm`
    directory.
5.  Never commit the credential file to GitHub.

The current source also contains a spreadsheet ID directly in
`server/googleSheets.js` and `server/index.js`. Configure the correct ID
in both locations before running the project. For a safer production
setup, move credentials and the spreadsheet ID into environment
variables rather than hardcoding them.

### 4. Start the backend

Development mode with automatic restarts:

``` bash
npm run dev
```

Or run normally:

``` bash
npm start
```

The server listens at:

``` text
http://localhost:5000
```

### 5. Open the frontend

Open `client/crm/index.html` in a browser, or serve the frontend using a
local static web server. Check that the frontend's API requests point to
`http://localhost:5000` while testing locally.

The frontend and backend must both be running/accessible for lead
submissions and dashboard data to work.

## API Endpoints

The Express backend currently defines the following endpoints:

  ----------------------------------------------------------------------------------
  Method                  Endpoint                           Purpose
  ----------------------- ---------------------------------- -----------------------
  `POST`                  `/submit`                          Adds a submitted lead
                                                             to Google Sheets

  `GET`                   `/leads?role=owner`                Retrieves all lead rows
                                                             for the owner role

  `GET`                   `/leads?role=employee&user=emp1`   Returns the header and
                                                             rows assigned to the
                                                             specified user

  `POST`                  `/assign-lead`                     Updates a lead's
                                                             assigned employee

  `POST`                  `/update-status`                   Updates a lead's status
  ----------------------------------------------------------------------------------

### Example: Submit a lead

``` json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210",
  "countryCode": "+91",
  "source": "Website"
}
```

Send this JSON body to `POST /submit` with the
`Content-Type: application/json` header.

## Google Sheet Data Layout

The current backend reads and writes columns `A:H` in `Sheet1`:

  Column   Data
  -------- -------------------
  A        Name
  B        Email
  C        Phone
  D        Country code
  E        Lead source
  F        Created timestamp
  G        Status
  H        Assigned to

Make sure the spreadsheet columns and tab name match this layout. The
current implementation assigns new leads to `emp1` by default.

## GitHub Safety Checklist

Before pushing the project to GitHub, ensure these files and folders are
excluded:

``` gitignore
node_modules/
server/credentials.json
.env
.env.*
!.env.example
```

If your repository contains the CRM inside a parent folder, adjust the
ignore patterns to match that location (for example,
`crm/server/credentials.json`).

If credentials were committed previously, deleting the file in a later
commit is not enough to make a leaked key safe. Revoke or rotate the
exposed service-account key in Google Cloud.

## Current Limitations and Production Considerations

-   The Google Sheets spreadsheet ID is hardcoded in the current backend
    source.
-   The code expects the service-account JSON key at a local file path.
-   The lead assignment and status endpoints currently have no
    authentication or authorization checks.
-   CORS is enabled, but CORS is **not** an access-control or
    authentication mechanism.
-   The current role-based filtering relies on query-string values and
    should not be trusted as secure authorization.
-   The default employee assignment (`emp1`) is temporary behavior in
    the current implementation.
-   Validate and sanitize incoming lead data before writing it to the
    sheet.
-   Consider moving to a database such as MySQL or PostgreSQL if the
    application's data complexity, concurrency, and reporting needs
    grow.

## Roadmap Ideas

Potential future enhancements include:

-   Secure authentication and role-based authorization
-   Employee and owner management
-   Search, filtering, analytics, and reporting
-   Configurable lead assignment rules
-   AI-assisted lead scoring and sentiment analysis
-   Marketing automation and notification workflows
-   Environment-based configuration and deployment documentation

These are roadmap ideas and should not be considered implemented unless
present in the code.

## Contributing

1.  Create a branch for your change.
2.  Make and test the change locally.
3.  Keep credentials and environment files out of commits.
4.  Open a pull request describing the change.

## License

The `package.json` currently specifies the ISC license. Add a `LICENSE`
file if you intend to distribute the project under that license.

------------------------------------------------------------------------

Built as a real-estate lead management CRM prototype using HTML, CSS,
JavaScript, Node.js, Express, and Google Sheets.
