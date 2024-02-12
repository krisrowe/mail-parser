const { load } = require('./specs');

async function extractValuesFromEmail(emailData) {
    if (!emailData || typeof emailData !== 'object') {
        console.error('No email data received or not an object.');
        return; // Consider throwing an error here.
    }
    if (!emailData.type) {
        console.error('Message type not specified.');
        return; // Consider throwing an error here.
    }

    const spec = await load(emailData.type);
    if (!spec) {
        throw 'No spec found for message type.';
    }
    const rules = spec.properties;
    if (!rules || !Array.isArray(rules) || rules.length <= 0) {
        throw 'No properties defined in spec found for message type.';
    }
    console.info(`Loaded ${rules.length} rules for message type ${emailData.type}.`);

    let result = {};
    const parserModule = require('./parser.js'); // Ensure this path is correct

    for (const rule of rules) {
        if (rule.function) {
            // Check if the function exists in the parserModule
            if (typeof parserModule[rule.function] === 'function') {
                // Determine the appropriate source text or null if not applicable
                let sourceText = rule.source && emailData[rule.source] ? emailData[rule.source] : null;
                result[rule.name] = parserModule[rule.function](sourceText, rule.param);
                console.log(`Processed content for property ${rule.name} using function ${rule.function}.`);
            } else {
                // Function specified is not found in the parser module
                console.error(`Function ${rule.function} specified for property ${rule.name} is not defined.`);
                continue; // Skip to the next rule or handle this case as needed
            }
        } else if (rule.param !== undefined) {
            // Directly assign the param to the property if no function is specified
            result[rule.name] = rule.param;
            console.log(`Assigned param directly to property ${rule.name}.`);
        } else {
            // If no function and no param, attempt to transfer the value as-is
            let value = rule.source && emailData[rule.source] ? emailData[rule.source] : undefined;
            if (value !== undefined) {
                result[rule.name] = value;
                console.log(`Transferred value from ${rule.source} to property ${rule.name}.`);
            } else {
                console.warn(`No source specified for property ${rule.name}, and no value could be transferred.`);
            }
        }
    }
    
    console.info(`Processed email. Properties updated: ${Object.keys(result).length}`);
    return result;
}

module.exports = {
    extractValuesFromEmail
};
