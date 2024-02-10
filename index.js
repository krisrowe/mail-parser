const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();
const configCache = { };

async function parseEmail(message, context) {
    if (!message || typeof message !== 'object') {
        throw new Error("No message received or message format is invalid.");
    }
    
    let messageId;
    let bookingData;

    // Determine if message is a Pub/Sub message or direct payload
    if (message.data) {
        // Handling Pub/Sub message
        messageId = message.messageId || message.id;
        console.info('Processing an email as pub sub message id ' + messageId);
        const data = Buffer.from(message.data, 'base64').toString();
        console.log(`Message data length for pub sub message id ${messageId}: ${data.length}`);
        bookingData = JSON.parse(data);
    } else if (message.type) {
        // Handling direct payload (e.g., from testing feature)
        console.info('Processing a direct payload without pub sub message envelope.');
        messageId = message.id || 'DirectPayload-' + Date.now(); // Assign a unique ID for logging
        bookingData = message; // Directly use the message as booking data
    } else {
        throw new Error("Invalid message format. Message must have 'data' or 'type'.");
    }

    console.log("JSON parsed successfully for message id " + messageId + ".");
    let processedData = await extractValuesFromEmail(bookingData);

    const outputTopicName = process.env.OUTPUT_TOPIC;
    console.log(`Output topic name ${outputTopicName} found in environment variable OUTPUT_TOPIC.`);
    if (!outputTopicName) {
        throw new Error('Output topic name must be specified using OUTPUT_TOPIC environment variable.');
    }
    console.log(`Publishing processed data to topic ${outputTopicName}.`);
    await publishToTopic(outputTopicName, processedData);
    
    if (processedData.type) {
        console.info(`Published parsed email as message of type ${processedData.type} to topic ${outputTopicName}.`);
    } else {
        console.warn(`Published parsed email to topic ${outputTopicName}. No type attribute.`);
    }
}


async function extractValuesFromEmail(emailData) {
    if (!emailData) {
        throw 'No email data received.';
    }
    if (!emailData.type) {
        throw 'Message type not specified.';
    }

    const rules = await require('./specs').load(emailData.type);
    let result = {};
    const parserModule = require('./parser.js'); // Replace with the actual path
    
    var contentsFound = 0;
    for (const rule of rules) {
        const sourceText = rule.source === 'subject' ? emailData.subject : emailData.body;
        
        if (typeof parserModule[rule.function] === 'function') {
            const content = parserModule[rule.function](sourceText, rule.param);
            if (content) {
                result[rule.property] = content;
                contentsFound++;
                console.log(`Found content for property ${rule.property}.`);
            } else {
                console.warn(`No content found for property ${rule.property}.`);
            }
        } else {
            throw `Unsupported parsing function ${rule.function} configured.`;
        }
    }
    if (contentsFound === 0) {
        throw 'No content found for any properties.';
    } else {
        console.info(`Found content for ${contentsFound} out of ${rules.length} properties.`);
    }
    
    return result;
}

async function publishToTopic(topicName, data) {
    if (!topicName) {
        throw 'No topic name specified to publish to.';
    }
    if (!data || typeof data !== 'object') {
        throw 'Must provide data to publish as an object.';
    }
    const pubSubClient = new PubSub()
    const messageJSON = JSON.stringify(data);
    const dataBuffer = Buffer.from(messageJSON);
    var success = false;
    try {
        await pubSubClient.topic(topicName).publish(dataBuffer);
        success = true;
    } catch (error) {
        console.error(`Error publishing message to topic ${topicName}: `, error);
        success = false;
    }
    // Log outside the try/catch above to avoid misreporting a publish failure.
    if (success) {
        var logMessage = `Message published to topic ${topicName}`;
        // Add the actual message we published to the log output only 
        // if the LOG_OUTPUT env var has been defined accordingly. 
        // Note that this env var is not set to true by default, due
        // to the concerns that sensitive data may be put in the logs.
        if ((process.env.LOG_OUTPUT + "").trim().toLowerCase() == 'true') {
            logMessage += `: ${messageJSON}`;
        }
        console.info(logMessage);
    }
}

// Export functions if needed for testing
exports['parse-email'] = parseEmail;
exports.extractValuesFromEmail = extractValuesFromEmail;

// Export the name assigned when deploying as a Cloud Function
// so that the corect entry point will be found and used.
exports['parse-email'] = parseEmail;
