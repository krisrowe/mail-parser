const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { extractValuesFromEmail } = require('../processor'); // Adjust the path as needed

describe('processor', function() {
  let outputMessage; // Holds the extracted values

  before(async function() {
    // Load and parse the input JSON only once before all tests
    const inputJsonPath = path.join(__dirname, 'data', 'email.json');
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
    // Parse the expected date string to a JS Date object
    const expectedCheckInDate = new Date('2024-01-16T06:00:00.000Z');
    // Access the actual Date object from your output JSON
    const actualCheckInDate = new Date(outputMessage.checkIn);
    // Compare the numeric values of the two dates
    expect(actualCheckInDate.getTime()).to.equal(expectedCheckInDate.getTime());
  });
  
  it('should correctly parse the check-out date', function() {
    // Parse the expected date string to a JS Date object
    const expectedCheckOutDate = new Date('2024-01-18T06:00:00.000Z');
    // Access the actual Date object from your output JSON
    const actualCheckOutDate = new Date(outputMessage.checkOut);
    // Compare the numeric values of the two dates
    expect(actualCheckOutDate.getTime()).to.equal(expectedCheckOutDate.getTime());
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
