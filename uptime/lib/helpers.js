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

  static
}

export default Helpers;
