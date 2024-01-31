const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { processEmail } = require('../index'); // Adjust the path as needed


describe('Email Processing Tests', function() {
  it('should correctly parse all Airbnb booking fields', async function() {
    // Read input JSON from file
    const inputJsonPath = path.join(__dirname, 'data', 'email-airbnb-new-booking.json');
    const inputJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf8'));

    // Call processEmail
    const outputJson = await processEmail(inputJson);

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
    expect(outputJson).to.have.property('hostPayout').that.is.a('number');
    expect(outputJson).to.have.property('serviceFee').that.is.a('number');

    // More assertions as needed
  });
});
