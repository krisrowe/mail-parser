const {PubSub} = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();
const processor = require('./processor');

async function parseEmail(message, context) {
    if (!message || typeof message !== 'object') {
        throw new Error("No message received or message format is invalid.");
    }
    
    let messageId;
    let incomingData;

    // Determine if message is a Pub/Sub message or direct payload
    if (message.data) {
        // Handling Pub/Sub message
        messageId = message.messageId || message.id;
        console.info('Processing an email as pub sub message id ' + messageId);
        const data = Buffer.from(message.data, 'base64').toString();
        console.log(`Message data length for pub sub message id ${messageId}: ${data.length}`);
        incomingData = JSON.parse(data);
    } else if (message.type) {
        // Handling direct payload (e.g., from testing feature)
        console.info('Processing a direct payload without pub sub message envelope.');
        messageId = message.id || 'DirectPayload-' + Date.now(); // Assign a unique ID for logging
        incomingData = message; // Directly use the message as booking data
    } else {
        throw new Error("Invalid message format. Message must have 'data' or 'type'.");
    }

    return await processMessageData(incomingData, messageId);
}

exports["handle-http"] = async (req, res) => {
    // make sure JSON was sent as per header
    if (req.headers['content-type'] !== 'application/json') {
        res.status(400).send('Invalid content type. Must be application/json.');
        return;
    }
    await processMessageData(req.body);
    res.status(200).send('Processed message via HTTP');
};
  

async function processMessageData(message, id = null) {
    var processedData;
    try {
        processedData = await processor.extractValuesFromEmail(message);
    } catch (err) {
        console.error("Error extracting values from incoming message: ", err);
        throw err;
    }
    if (!processedData) {
        throw new Error("Failed to extract values from incoming message.");
    }

    const outputTopicName = process.env.OUTPUT_TOPIC;
    console.log(`Output topic name ${outputTopicName} found in environment variable OUTPUT_TOPIC.`);
    if (!outputTopicName) {
        throw new Error('Output topic name must be specified using OUTPUT_TOPIC environment variable.');
    }
    console.log(`Publishing processed data to topic ${outputTopicName}.`);
    var outputMessageId;
    try
    {
        outputMessageId = await publishToTopic(outputTopicName, processedData);
    } catch (err) {
        console.error("Error publishing message to topic: ", err);
        // Raise a failure back to the invoking service so that the incoming
        // message is not marked processed. 
        throw err; 
    }
    var logMessage = `Published transformed message to topic ${outputTopicName} as ${outputMessageId}.`
    try 
    {
        if (id) {
            logMessage += ` Source message id: ${id}.`;
        }
        // Add the actual message we published to the log output only 
        // if the LOG_OUTPUT env var has been defined accordingly. 
        // Note that this env var is not set to true by default, due
        // to the concerns that sensitive data may be put in the logs.
        if ((process.env.LOG_OUTPUT + "").trim().toLowerCase() == 'true') {
            logMessage += ` Data: ${JSON.stringify(processedData)}`;
        }        

    } catch {
        // extra log detail is not important enough to avoid logging anything at all and crashing
    }
    console.log(JSON.stringify({
        severity: 'INFO',
        message: logMessage,
    }));    

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
    var messageId;
    try {
        return await pubSubClient.topic(topicName).publishMessage({ data: dataBuffer });
    } catch (error) {
        console.error(`Error publishing message to topic ${topicName}: `, error);
        throw error;
    }
}

// Export the name assigned when deploying as a Cloud Function
// so that the corect entry point will be found and used.
exports['parse-email'] = parseEmail;
