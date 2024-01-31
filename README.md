# Project Setup Instructions

This document outlines the instructions for setting up the necessary service account and permissions for the project.

## Prerequisites

- Ensure you have the Google Cloud SDK (`gcloud`) installed and authenticated to interact with your Google Cloud project.
- Set your project ID as an environment variable for convenience.

## Set Project ID

Replace `your-project-id` with your actual Google Cloud project ID and set it as an environment variable:

```bash
export PROJECT_ID=your-project-id
```

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
gcloud pubsub topics create output-events --project=${PROJECT_ID}
```

## Grant Access to Pub/Sub Topic
Grant the service account publish access to the Pub/Sub topic parsed-emails:
```bash
gcloud pubsub topics add-iam-policy-binding output-events \
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
gsutil cp example.yaml gs://mail-parsing-config/transaction.yaml
```

## Local Testing

Ensure service sccount credentials saved locally:
1. Find the service that has access to invoke the Cloud Function in the Google Cloud Console
2. Download the JSON key file for the service account and save to secrets/service-account.json, as this file is not version-controlled for security reasons.

### Local Unit Testing with Debugging in VSCode
Use the Run Mocha Tests debug configuration in VSCode under Run and Debug.

### Mocha Unit Tests
```bash
npm test
```
