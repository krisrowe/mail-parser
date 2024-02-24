const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { extractValuesFromEmail } = require('../processor'); // Adjust the path as needed
const SPEC_NAME = "airbnb-booking";

describe(SPEC_NAME, function() {
  let outputMessage; // Holds the extracted values

  before(async function() {
    // Load and parse the input JSON only once before all tests
    const inputJsonPath = path.join(__dirname, 'data', `${SPEC_NAME}.json`);
    const inputJson = JSON.parse(fs.readFileSync(inputJsonPath, 'utf8'));
    outputMessage = await extractValuesFromEmail(inputJson);
    console.log(JSON.stringify(outputMessage));
    
  });

  it('should return a JSON object', function() {
    expect(outputMessage).to.be.an('object'); 
  });

  it('should identify the correct type', function() {
    expect(outputMessage).to.have.property('type', 'booking');
  });

  it('should correctly parse the received date', function() {
    expect(outputMessage).to.have.property('received', '2024-01-14T15:37:17.000Z');
  });

  it('should correctly identify the platform as Airbnb', function() {
    expect(outputMessage).to.have.property('platform', 'Airbnb');
  });
  
  it('should correctly parse the check-in date', function() {
    expect(outputMessage).to.have.property('checkIn', '2024-01-16');
  });
  
  it('should correctly parse the check-out date', function() {
    expect(outputMessage).to.have.property('checkOut', '2024-01-18');
  });
  
  it('should correctly parse the confirmation number', function() {
    expect(outputMessage).to.have.property('conf', 'HMXXX24X8Y');
  });

  it('should correctly parse the guest name', function() {
    expect(outputMessage).to.have.property('guest', 'John Smith');
  });

  it('should correctly parse the property ID', function() {
    expect(outputMessage).to.have.property('property', '12345');
  });

  it('should correctly parse the guest paid total', function() {
    expect(outputMessage).to.have.property('guestPaidTotal', 575.33);
  });

  it('should correctly parse the cleaning fee', function() {
    expect(outputMessage).to.have.property('cleaningFee', 120.00);
  });

  it('should correctly parse the guest service fee', function() {
    expect(outputMessage).to.have.property('guestServiceFee', 64.66);
  });

  it('should correctly parse the occupancy taxes', function() {
    expect(outputMessage).to.have.property('occupancyTaxes', 52.67);
  });

  it('should correctly parse the payout', function() {
    expect(outputMessage).to.have.property('payout', 444.26);
  });

  it('should correctly parse the rent', function() {
    expect(outputMessage).to.have.property('rent', 338.00);
  });

  it('should correctly parse the service fee', function() {
    expect(outputMessage).to.have.property('serviceFee', 13.74);
  });

  after(function(done) {
    // Optionally, include any cleanup logic here
    setTimeout(done, 2000);
  });
});
