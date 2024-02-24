const moment = require('moment-timezone');

class Parser {
  constructor() {
    this._referenceDate = new Date();
  }

  get referenceDate() {
    return this._referenceDate;
  }

  set referenceDate(value) {
    this._referenceDate = value;
  }

  text(sourceText, regex) {
    const regExp = new RegExp(regex, 'i'); // 'i' for case-insensitive
    const match = regExp.exec(sourceText);
  
    if (match && match.length > 1) {
        // match[1] contains the captured group
        return match[1];
    } else {
        return ""; // or however you want to handle non-matches
    }
  }
  
  date(sourceText, regex) {
    const regExp = new RegExp(regex, 'i');
    const match = regExp.exec(sourceText);
  
    if (match && match.length > 1) {
      let dateString = match[1].replace(' at ', ' ');
      let yearNeedsCorrection = false;
      let timeIncluded = false; // Initially assume time is not included
  
      // Define formats
      let monthDayFormats = ['MMM D', 'MMMM D'];
      let timeFormats = ['H:mm', 'HH:mm', 'H:mm A', 'HH:mm A']; // Formats to detect time
      let formatsWithTime = timeFormats.map(timeFormat => `MMM D, YYYY ${timeFormat}`) // Date with time formats
                                        .concat(timeFormats.map(timeFormat => `MMMM D, YYYY ${timeFormat}`));
      let formatsWithYearOnly = ['MMM D, YYYY', 'MMMM D, YYYY']; // Date without time formats
  
      // First check: Try parsing with month and day only to see if year needs correction
      let parsedDate = moment(dateString, monthDayFormats, true);
      if (parsedDate.isValid()) {
        yearNeedsCorrection = true;
      } else {
        // Next, try to parse with formats that include time
        parsedDate = moment(dateString, formatsWithTime, true);
        if (parsedDate.isValid()) {
          timeIncluded = true; // Successfully parsed a format with time
        } else {
          // If no time included, try formats with year only (no time)
          parsedDate = moment(dateString, formatsWithYearOnly, true);
        }
      }
  
      if (parsedDate.isValid()) {
        if (yearNeedsCorrection) {
          // Adjust the year based on reference or current year
          const year = this.referenceDate ? this.referenceDate.getFullYear() : new Date().getFullYear();
          parsedDate.year(year);
        }
  
        // Handle timezone if necessary and time is included
        if (timeIncluded) {
          const timezone = process.env.EMAIL_TIMEZONE;
          if (timezone) {
            parsedDate = parsedDate.tz(timezone, true);
          } else {
            console.warn('EMAIL_TIMEZONE environment variable is not set.');
          }
        }
  
        // Decide on return type based on whether time was included
        if (timeIncluded) {
          return parsedDate.toDate(); // Return JavaScript Date object for full date/time
        } else {
          return parsedDate.format('YYYY-MM-DD'); // Return string for date-only
        }
      } else {
        // Log a debug message when parsing fails
        console.debug(`Unable to parse date from input: '${sourceText}'`);
        return null; // Date is invalid or does not match any format
      }
    } else {
      // Log a debug message when no match is found
      console.debug(`No date match found in input: '${sourceText}'`);
      return null; // No match found
    }
  }  
  
  amount(sourceText, regex) {
    const regExp = new RegExp(regex, 'i');
    const match = regExp.exec(sourceText);
  
    if (match && match.length > 1) {
        // Convert captured string to a number, removing commas
        return parseFloat(match[1].replace(/,/g, ''));
    } else {
        return 0; // or however you want to handle non-matches
    }
  }
  
  literal(sourceText, value) {
    return value;
  }
}

module.exports = Parser;