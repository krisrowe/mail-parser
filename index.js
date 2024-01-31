const {PubSub} = require('@google-cloud/pubsub');
const {Storage} = require('@google-cloud/storage');
const yaml = require('js-yaml');
const pubSubClient = new PubSub();
const storage = new Storage();  

const bucketName = 'mail-parsing-config';
const configCache = {};

exports.parseEmail = async (message, context) => {
    const data = message.data ? Buffer.from(message.data, 'base64').toString() : '{}';
    const bookingData = JSON.parse(data);

    let processedData = await processEmail(bookingData);
    await publishToTopic('booking-events', processedData);
};
async function processEmail(emailData) {
    const config = await loadConfig(emailData.type);
    if (!config || !config[emailData.type]) {
        console.error(`Configuration not found for type: ${emailData.type}`);
        return {};
    }


    const rules = config[emailData.type];
    let result = {};
    const parserModule = require('./parser.js'); // Replace with the actual path
    
    for (const rule of rules) {
        const sourceText = rule.source === 'subject' ? emailData.subject : emailData.body;
        
        if (typeof parserModule[rule.function] === 'function') {
            result[rule.property] = parserModule[rule.function](sourceText, rule.param);
        } else {
            throw `Unsupported parsing function ${rule.function} configured.`;
        }
    }
    
    return result;
}

async function loadConfig(type) {
    if (!configCache[type]) {
        const fileName = `${type}.yaml`;
        try {
            const [fileContents] = await storage.bucket(bucketName).file(fileName).download();
            configCache[type] = yaml.load(fileContents.toString('utf8'));
        } catch (error) {
            console.error(`Error loading configuration from storage: `, error);
            return null;
        }
    }
    return configCache[type];
}

async function publishToTopic(topicName, data) {
  const dataBuffer = Buffer.from(JSON.stringify(data));
  try {
      await pubSubClient.topic(topicName).publish(dataBuffer);
      console.log(`Message published to topic ${topicName}`);
  } catch (error) {
      console.error(`Error publishing message to topic ${topicName}: `, error);
  }
}

// Implement extractSingleValue, extractAmountField, etc., similar to previous examples

// Add the rest of your helper functions and publishToTopic function here

// Export functions if needed for testing
exports.processEmail = processEmail;
exports.loadConfig = loadConfig;
// Export other functions if they are to be tested independently
