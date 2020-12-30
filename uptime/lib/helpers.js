import crypto from "crypto";

import config from "./config";

/** Helpers for various tasks */
class Helpers {
  /**
   * @desc Create a SHA256 hash
   * @static
   * @param {string} str - The string to be hashed
   * @return {(string | boolean)} The hashed string or false if hashing fails
   */
  static hash(str) {
    if (typeof str === "string" && str.length > 0) {
      const hash = crypto
        .createHmac("sha256", config.hashingSecret)
        .update(str)
        .digest("hex");

      return hash;
    }
    return false;
  }

  /**
   * @desc Parse a JSON string to an object in all cases without throwing
   * @static
   * @param {string} str - The JSON string to be parsed
   * @returns {object} The parsed object
   */
  static fromJson(str) {
    return JSON.parse(str);
  }

  /**
   * @desc Stringify JS object to JSON
   * @static
   * @param {object} data - Data object
   * @returns {striing} The JSON string
   */
  static toJson(data) {
    return JSON.stringify(data);
  }

  /**
   * @desc Create a string of random alphanumeric character of a given length
   * @static
   * @param {number} strLength - The number of characters of the random string
   * @return {(string | boolean)} The generated random string or false if fails
   */
  static createRandomString(strLength) {
    strLength =
      typeof strLength === "number" && strLength > 0 ? strLength : false;

    if (strLength) {
      // Define all the possible characters that could go into a string
      const possibleCharacters =
        "abcdefghijklmnopqrstuvwxyz0123456789_-ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      // Final random string
      let randomString = "";
      for (let i = 1; i <= strLength; i++) {
        const randomCharacter = possibleCharacters.charAt(
          Math.floor(Math.random() * possibleCharacters.length)
        );
        randomString += randomCharacter;
      }

      // Return the random string
      return randomString;
    }
    return false;
  }

  sendTwilioSms (phone, msg, callback) {
  // Validate parameters
  phone =
    typeof phone === 'string' && phone.trim().length === 10
      ? phone.trim()
      : false;
  msg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (phone && msg) {
    // Configure the request payload
    const payload = {
      From: config.twilio.fromPhone,
      To: `+1${phone}`,
      Body: msg
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // Grab the status of the sent request
      const status = res.statusCode;

      // Callback successfully if request went through
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });

    // Bind to the error event so it doesn't get thrown
    req.on('error', (err) => callback(err))

    // Add the payload
    req.write(stringPayload)

    // End the request
    req.end()
  } else {
    callback('Given parameters were missing or invalid');
  }
}

export default Helpers;
