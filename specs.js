const { Storage } = require('@google-cloud/storage');
const yaml = require('js-yaml');
const fs = require('fs').promises; // Add this line to use the file system
const storage = new Storage();

const CONFIG_BUCKET = process.env.CONFIG_BUCKET || 'mail-parsing-config';
const configCache = {};

async function load(name) {
    if (!configCache[name]) {
        const overridePath = process.env.OVERRIDE_SPEC_PATH;
        try {
            let configYaml;
            if (overridePath) {
                // If OVERRIDE_SPEC_PATH is defined, read the config from the specified local path
                console.log(`Loading override configuration for spec ${name} from OVERRIDE_SPEC_PATH: ${overridePath}.`);
                const filePath = `${overridePath}`; // Assuming the file name follows the same convention
                const fileContents = await fs.readFile(filePath, 'utf8');
                configYaml = yaml.load(fileContents);
                console.log(`Configuration for spec ${name} loaded from OVERRIDE_SPEC_PATH: ${overridePath}.`);
            } else {
                // Otherwise, use the existing logic to load from Google Cloud Storage
                console.log(`Loading configuration for spec ${name} from storage bucket ${CONFIG_BUCKET}.`);
                const fileName = `${name}.yaml`;
                const [fileContents] = await storage.bucket(CONFIG_BUCKET).file(fileName).download();
                console.log(`Configuration for spec ${name} loaded from storage bucket ${CONFIG_BUCKET}.`);
                configYaml = yaml.load(fileContents.toString('utf8'));
                console.log(`Successfully parsed configuration for spec ${name} as YAML.`);
            }
            configCache[name] = configYaml[name];
        } catch (error) {
            throw `Error loading configuration: ${error}`;
        }
    } else {
        console.log(`Configuration for type ${name} already loaded.`);
    }
    return configCache[name];
}

module.exports = { load };