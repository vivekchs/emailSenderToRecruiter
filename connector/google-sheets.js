const { google } = require('googleapis');
const path = require('path');
const logger = require('../utils/logger');

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, '../config/google-service-account.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

function extractSheetId(urlOrId) {
  const match = urlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : urlOrId;
}

async function getSheetData(sheetLinkOrId, companyName) {
  try {
    const sheetId = extractSheetId(sheetLinkOrId);
    logger.info(`Extracted sheetId: ${sheetId}`);

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const metadata = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetName = metadata.data.sheets[0].properties.title;

    logger.info(`Found sheet tab: ${sheetName}`);

    const range = `${sheetName}!A1:C`;
    logger.info(`Fetching range: ${range}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range
    });

    const rows = res.data.values;

    if (!rows || rows.length < 2) {
      logger.error('Sheet is empty or missing headers.');
      throw new Error('Sheet is empty or missing headers.');
    }

    const headers = rows[0].map(h => h.trim().toLowerCase());
    logger.info(`Found headers: ${headers.join(', ')}`);

    const data = rows.slice(1).map((row, index) => {
      const entry = {};
      headers.forEach((key, i) => {
        entry[key] = row[i] || '';
      });
      logger.info({ row: index + 2, data: entry }, `Parsed row ${index + 2}`);
      return entry;
    });

    // ✅ Filter by company name (case insensitive)
    const filteredData = companyName
  ? data.filter(entry => entry.company?.toLowerCase().trim() === companyName.toLowerCase().trim())
  : data;

    console.log('filteredData', filteredData);
    return filteredData;
  } catch (error) {
    logger.error({ err: error }, 'Failed to read sheet data');
    throw error;
  }
}

module.exports = { getSheetData };
