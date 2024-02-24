# Project Setup Instructions

This document outlines the instructions for setting up the necessary service account and permissions for the project.

## Service Account Creation
Create the service account mailparser:
```bash
gcloud iam service-accounts create mailparser \
  --description="Service account for mail parsing" \
  --display-name="mailparser" \
  --project=${PROJECT_ID}
```

## Grant roles
```bash
gsutil iam ch serviceAccount:mailparser@${PROJECT_ID}.iam.gserviceaccount.com:roles/storage.objectViewer gs://mail-parsing-config
```

## Create the Pub/Sub Topic
```bash
gcloud pubsub topics create my-events --project=${PROJECT_ID}
```

## Grant Access to Pub/Sub Topic
Grant the service account publish access to the Pub/Sub topic parsed-emails:
```bash
gcloud pubsub topics add-iam-policy-binding my-events \
  --member="serviceAccount:mailparser@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher" \
  --project=${PROJECT_ID}
```

## Publish your parsing configuration yaml
Prepare the yaml. See below example, or see [example.yaml](example.yaml).
```yaml
Transaction:
  - property: type
    function: literal
    param: "transaction"
  - property: platform
    function: literal
    param: "MyPlatform"
  - property: date
    source: body
    function: date
    param: "Date: (\\d{4}-\\d{2}-\\d{2})"
  - property: amount
    source: body
    function: amount
    param: "Amount: \\$([0-9,]+\\.\\d{2})"
  - property: transactionId
    source: body
    function: text
    param: "Transaction ID: ([A-Z0-9]+)"
  - property: payer
    source: body
    function: text
    param: "Payer: ([A-Za-z ]+)"
  - property: recipient
    source: body
    function: text
    param: "Recipient: ([A-Za-z ]+)"
```
Publish to a Cloud Storage Bucket.
```bash
gsutil cp example.yaml gs://${YOUR-BUCKET}/transaction.yaml
```

# Local Testing

Ensure service sccount credentials saved locally:
1. Find the service that has access to your cloud storage bucket
2. Download the JSON key file for the service account and save to secrets/service-account.json, as this file is not version-controlled for security reasons.

### Local Unit Testing with Debugging in VSCode
Use the Run Mocha Tests debug configuration in VSCode under Run and Debug.

### Mocha Unit Tests
```bash
npm test
```

## Deploying the Cloud Function to GCP
To deploy this Cloud Function to Google Cloud Platform, follow these steps:

###  Prerequisites
* Ensure you have the Google Cloud SDK installed and configured for your project.
* Make sure you are authenticated to access your Google Cloud project. You can authenticate using the command gcloud auth login.

### Deployment Steps
1. Navigate to the repo root directory via `cd`
2. Deploy the Function
Use the gcloud command to deploy your function to Cloud Functions. Run the following command in your terminal:
```bash
gcloud functions deploy parse-email \
  --region=us-central1 \
  --trigger-topic emails \
  --runtime=nodejs20 \
  --service-account='mailparser@'$PROJECT_ID'.iam.gserviceaccount.com' \
  --set-env-vars OUTPUT_TOPIC='my-events' \
  --project=$PROJECT_ID
```

# Environment Variables
## Mandatory
The following environment variables must be defined with your own values.
These are required to run, and there are no defaults assumed in the code.
```bash
OUTPUT_TOPIC=my-events # example only
EMAIL_TIMEZONE=America/Chicago # example only
```
## Optional overrides to alter behavior
Environment variables below are shown with the *default* values assumed
by the application's code when the environment variables are not present.
```bash
PORT=8080 # the port that the web API listens on
CONFIG_BUCKET=mail-parsing-config # the bucket for mail parsing spec yaml files
LOG_OUTPUT=false # if true, log msgs sent to the output topic (only for non-sensitive data)
```