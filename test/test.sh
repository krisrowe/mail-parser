#!/bin/bash

# Function to show usage
show_usage() {
  echo "Usage: $0 --local | --cloud"
  echo "  --local: Use the local server URL (http://localhost:8080)."
  echo "  --cloud: Use the cloud function URL, requires the secrets/service-account.json file."
}

# Determine the directory of the script
SCRIPT_DIR="$(dirname "$0")"

# Default payload file path
PAYLOAD_FILE="$SCRIPT_DIR/data/airbnb-booking.json"

# Initialize URL variable
URL=""

# Check if at least one argument is provided
if [[ $# -eq 0 ]]; then
  show_usage
  exit 1
fi

# Check if the payload file exists and is readable
if [[ ! -f "$PAYLOAD_FILE" ]]; then
  echo "Error: Payload file $PAYLOAD_FILE not found."
  exit 1
fi

# Process command-line arguments
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --local)
      URL="http://localhost:8080"
      shift # No additional arguments expected after --local
      ;;
    --cloud)
      # Ensure the service-account.json file exists
      if [[ ! -f "$SCRIPT_DIR/secrets/service-account.json" ]]; then
        echo "Error: service-account.json file not found."
        exit 1
      fi
      # Extract the project ID from the JSON file
      PROJECT_ID=$(jq -r '.project_id' "$SCRIPT_DIR/secrets/service-account.json")
      if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "null" ]]; then
        echo "Error: Project ID not found in the service-account.json file."
        exit 1
      fi
      # Retrieve the URL of the cloud function named 'mail-parser'
      URL=$(gcloud functions describe mail-parser --format 'value(httpsTrigger.url)' --project "$PROJECT_ID")
      if [[ -z "$URL" ]]; then
        echo "Error: Failed to retrieve the URL for the cloud function 'mail-parser'."
        exit 1
      fi
      shift # No additional arguments expected after --cloud
      ;;
    *)
      echo "Invalid argument: $key"
      show_usage
      exit 1
      ;;
  esac
done

# Check if URL is set
if [[ -z "$URL" ]]; then
  echo "Error: URL not set. This should not happen."
  exit 1
fi

echo "Sending POST request to $URL with payload file: $PAYLOAD_FILE"

# Send the POST request with the JSON payload to the determined URL
curl -X POST -H "Content-Type: application/json" -d @"$PAYLOAD_FILE" "$URL"
