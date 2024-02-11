const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { extractValuesFromEmail } = require('../processor'); // Adjust the path as needed
const SPEC_NAME = "airbnb-forwarded-booking";

describe(SPEC_NAME, function() {
  let outputMessage; // Holds the extracted values

  before(async function() {
    // Load and parse the input JSON only once before all tests
    const inputJsonPath = path.join(__dirname, 'data', `${SPEC_NAME}.json`);
    const json = fs.readFileSync(inputJsonPath, 'utf8');
    const inputJson = JSON.parse(json);
    outputMessage = await extractValuesFromEmail(inputJson);    
  });

  it('should return a JSON object', function() {
    expect(outputMessage).to.be.an('object');
  });

  it('should correctly parse the output event type', function() {
    expect(outputMessage).to.have.property('type', 'booking');
  });

  it('should correctly identify the guest name', function() {
    expect(outputMessage).to.have.property('guest', 'James Smith Sr');
  });

  it('should correctly parse the check-in date', function() {
    // create a Date object for the expected date of Jan 12, 2024
    const expectedCheckInDate = new Date(2024, 0, 12);
    const actualCheckInDate = new Date(outputMessage.checkIn);
    expect(actualCheckInDate.getTime()).to.equal(expectedCheckInDate.getTime());
  });

  it('should correctly parse the check-out date', function() {
    // create a Date object for the expected date of Jan 13, 2024
    const expectedCheckOutDate = new Date(2024, 0, 13);
    const actualCheckOutDate = new Date(outputMessage.checkOut);
    expect(actualCheckOutDate.getTime()).to.equal(expectedCheckOutDate.getTime());
  });

  it('should correctly parse the confirmation number', function() {
    expect(outputMessage).to.have.property('conf', 'HMXXX24X7Z');
  });

  it('should correctly parse the total paid by the guest', function() {
    expect(outputMessage).to.have.property('guestPaidTotal', 358.02);
  });

  it('should correctly parse the cleaning fee', function() {
    expect(outputMessage).to.have.property('cleaningFee', 120.00);
  });

  it('should correctly parse the guest service fee', function() {
    expect(outputMessage).to.have.property('serviceFee', 8.55);
  });

  it('should correctly parse the occupancy taxes', function() {
    expect(outputMessage).to.have.property('occupancyTaxes', 32.78);
  });

  it('should correctly calculate the host payout', function() {
    expect(outputMessage).to.have.property('payout', 276.45);
  });


  it('should correctly parse the rent', function() {
    expect(outputMessage).to.have.property('rent', 165.00);
  });

  after(function(done) {
    // Optionally, include any cleanup logic here
    setTimeout(done, 2000);
  });
});
