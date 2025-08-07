const { getSheetData } = require('../connector/google-sheets');
const transporter = require('../connector/mailer');
const EmailLog = require('../models/EmailLog');
const logger = require('../utils/logger');
const fs = require('fs');
const config = require('config');
const resumeFilePath = config.get('resume_file_path');
const senderEmail = config.get('sender_email');

if (!fs.existsSync(resumeFilePath)) {
  logger.error(`Attachment file not found at: ${resumeFilePath}`);
  throw new Error('Attachment file missing');
}

const emailSenderModule = async jsonData => {
  const emailIntervalMinutes = jsonData.emailIntervalMinutes || config.get('emailIntervalMinutes');
  logger.info(`jsonData body is: ${JSON.stringify(jsonData)}`);
  const { jobId, emailBodyTemplate, sheetId, companyName } = jsonData;
  logger.info(`sheetId is: ${sheetId}`);

  if (!sheetId || !jobId || !emailBodyTemplate || !companyName) {
    logger.error('Missing required parameters');
    return { error: 'Missing sheetId, jobId, companyName or emailBodyTemplate' };
  }
  if (!senderEmail) {
    logger.error('sendEmail is empty');
    return 'sendEmail is empty';
  }
  try {
    const contacts = await getSheetData(sheetId, companyName);
    logger.info(`contact is: ${JSON.stringify(contacts)} `);

    for (const person of contacts) {
      if (!person.name || !person.email || !person.company) continue;

      const personalized = emailBodyTemplate
        .replace(/{name}/g, toCamelCase(person.name))
        .replace(/{company}/g, toCamelCase(person.company))
        .replace(/{jobId}/g, jobId);

      logger.info(`personalized email is:\n${personalized}`);
      logger.info(`from: ${senderEmail} → to: ${person.email.trim()}`);

      await transporter.sendMail({
        from: senderEmail.trim(),
        to: person.email.trim(), // important: trims trailing spaces
        subject: `Referral for SDE-1 Role || Job ID: ${jobId}`,
        text: personalized,
        attachments: [
          {
            filename: config.get('fileResumeName'),
            path: resumeFilePath
          }
        ]
      });

      if (EmailLog?.create) {
        await EmailLog.create({
          name: person.name,
          email: person.email,
          company: person.company,
          jobId,
          sentAt: new Date()
        });
      }

      logger.info(`Email sent to ${person.name} (${person.email})`);
      logger.info(`Waiting before sending next email for ${emailIntervalMinutes} minute(s)`);
      await sleep(Number(emailIntervalMinutes) * 60 * 1000); // Delay in minutes
    }

    return { message: 'Emails sent successfully from Google Sheet!' };
  } catch (err) {
    logger.error(`error is ${err.message}`);
    throw err;
  }
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function toCamelCase(str) {
  if (!str) return '';
  return str
    .trim()
    .split(' ')[0]
    .toLowerCase()
    .replace(/^./, c => c.toUpperCase());
}

module.exports = { emailSenderModule };
