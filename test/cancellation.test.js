const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const { extractValuesFromEmail } = require('../processor'); // Adjust the path as needed

describe('airbnb-cancellation', function() {
  let outputMessage; // Holds the extracted values

  before(async function() {
    // Load and parse the input JSON only once before all tests
    const inputJsonPath = path.join(__dirname, 'data', 'airbnb-cancellation.json');
    const input = require(inputJsonPath);
    outputMessage = await extractValuesFromEmail(input);
    console.log(JSON.stringify(outputMessage));
    
  });

  it('should return a JSON object', function() {
    expect(outputMessage).to.be.an('object'); 
  });

  it('should identify the correct type', function() {
    expect(outputMessage).to.have.property('type', 'cancellation');
  });

  it('should correctly identify the platform as Airbnb', function() {
    expect(outputMessage).to.have.property('platform', 'Airbnb');
  });
  
  it('should correctly parse the confirmation number', function() {
    expect(outputMessage).to.have.property('conf', 'HMXXX24X8Y');
  });

  after(function(done) {
    // Optionally, include any cleanup logic here
    setTimeout(done, 2000);
  });
});
