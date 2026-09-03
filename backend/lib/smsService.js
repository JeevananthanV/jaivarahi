// Stubbed smsService to disable Twilio SMS calls

export const sendSMS = async (to, message) => {
  console.log(`[SMS DISABLED] Tried sending to: ${to}, Message: ${message}`);
  return { success: true, sid: "SMS_DISABLED" };
};

export const sendBulkSMS = async (contacts, message) => {
  console.log(`[SMS DISABLED] Tried sending bulk message to ${contacts.length} contacts`);
  return { sent: 0, failed: 0, results: [] };
};

export const renderTemplate = (template, variables = {}) => {
  let message = template.body_template || template;
  const varEntries = Object.entries(variables || {});
  for (const [key, value] of varEntries) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    message = message.replace(regex, String(value ?? ""));
  }
  for (const [key, value] of varEntries) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    message = message.replace(regex, String(value ?? ""));
  }
  return message;
};

export default { sendSMS, sendBulkSMS, renderTemplate };