const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { extractValuesFromEmail } = require('../index'); // Adjust the path as needed


describe('Email Processing Tests', function() {
  it('should correctly parse all Airbnb booking fields', async function() {
    // Read an email in JSON form from a local file for testing
    // versus receiving it via HTTP from a Pub/Sub push subscription.
    const inputJsonPath = path.join(__dirname, 'data', 'email.json');
    const inputJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf8'));

    // Run the parsing and extraction subroutine against the email
    // without pushing to the topic.
    const outputJson = await extractValuesFromEmail(inputJson);

    // Assertions for specific values and data types
    expect(outputJson).to.have.property('type').that.is.a('string').to.equal('booking');
    expect(outputJson).to.have.property('platform').that.is.a('string').to.equal('Airbnb');
    expect(outputJson).to.have.property('checkIn').that.is.a('Date');
    expect(outputJson).to.have.property('checkOut').that.is.a('Date');
    expect(outputJson).to.have.property('conf').that.is.a('string');
    expect(outputJson).to.have.property('guestPaidTotal').that.is.a('number');
    expect(outputJson).to.have.property('cleaningFee').that.is.a('number');
    expect(outputJson).to.have.property('guestServiceFee').that.is.a('number');
    expect(outputJson).to.have.property('occupancyTaxes').that.is.a('number');
    expect(outputJson).to.have.property('payout').that.is.a('number');
    expect(outputJson).to.have.property('serviceFee').that.is.a('number');

    // More assertions as needed
  });

  after(function(done) {
    // Wait for a bit for async calls to Cloud Logging to complete. 
    setTimeout(done, 2000);
  });
});
