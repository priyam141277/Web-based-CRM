const { google } = require("googleapis");

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  throw new Error("SPREADSHEET_ID is not configured");
}

function getAuth() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("Google credentials are not configured");
  }

  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function getSheets() {
  const auth = getAuth();
  const client = await auth.getClient();

  return google.sheets({
    version: "v4",
    auth: client,
  });
}

async function addLead(data) {
  const sheets = await getSheets();

  const { name, email, phone, countryCode, source } = data;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:H",
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[
        name,
        email,
        phone,
        countryCode,
        source,
        new Date().toLocaleString(),
        "New",
        "emp1"
      ]]
    }
  });
}

async function getLeads() {
  const sheets = await getSheets();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:H"
  });

  return res.data.values || [];
}

async function updateCell(rowIndex, column, value) {
  const sheets = await getSheets();

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!${column}${rowIndex}`,
    valueInputOption: "USER_ENTERED",
    resource: {
      values: [[value]]
    }
  });
}

module.exports = {
  addLead,
  getLeads,
  updateCell
};