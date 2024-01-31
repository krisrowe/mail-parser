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
This command will deploy the parse-emails function with the following configurations:

* Region: us-central1. The function will be deployed in the us-central1 region.
* Trigger: HTTP. This makes your function accessible over HTTP.
* Runtime: nodejs20. Specifies Node

### Define that our service account can invoke this function

```bash
gcloud functions add-iam-policy-binding parse-emails \
  --member='serviceAccount:mailparser@'$PROJECT_ID'.iam.gserviceaccount.com' \
  --role='roles/cloudfunctions.invoker' \
  --project=$PROJECT_ID
```

### Invoke Cloud Function on GCP

```bash
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

IDENTITY_TOKEN=$(gcloud auth print-identity-token)

curl -X POST "https://us-central1-${PROJECT_ID}.cloudfunctions.net/parse-emails" \
  -H "Authorization: bearer $IDENTITY_TOKEN" \
  -H "EMAIL_MESSAGE_TYPE: NewAirbnbBooking" \
  -H "EMAIL_FILTER_FROM: airbnb.com" \
  -H "EMAIL_FILTER_SUBJECT: Reservation confirmed" \
  -H "EMAIL_FILTER_AFTER: 2024-01-01" \
  -H "TOPIC: airbnb"
```
