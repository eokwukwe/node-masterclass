import fs from "fs";
import url from "url";
import util from "util";
import http from "http";
import https from "https";

import Logs from "./logs";
import Helpers from "./helpers";
import DataOperations from "./data";

/**
 * Worker-related task
 */
class Workers {
  /**
   * Create a Workers instance
   */
  constructor() {
    this.data = new DataOperations();
    this.logs = new Logs();
    this.debug = util.debuglog("workers");
  }

  /**
   * @desc Look up all checks, get their data, and send to a validator
   */
  async getAllChecks() {
    try {
      // Get all Checks
      const checks = await this.data.list("checks");

      await Promise.all(
        checks.map(async (check) => {
          try {
            // Read in the check data
            const originalCheckData = await this.data.read("checks", check);

            // Pass the data to the check validator and let the function
            // continue or log error as needed
            this.validateCheckData(originalCheckData);
          } catch (error) {
            this.debug("Error reading one of the check's data");
          }
        })
      );
    } catch (error) {
      this.debug("Error: Could not find any checks to process");
    }
  }

  /**
   * @desc Validate check data
   *
   * @param {object} originalCheckData
   * @returns {void}
   */
  validateCheckData(originalCheckData) {
    originalCheckData =
      typeof originalCheckData === "object" && originalCheckData !== null
        ? originalCheckData
        : {};

    originalCheckData.id =
      typeof originalCheckData.id === "string" &&
      originalCheckData.id.trim().length === 20
        ? originalCheckData.id.trim()
        : false;

    originalCheckData.userPhone =
      typeof originalCheckData.userPhone === "string" &&
      originalCheckData.userPhone.trim().length === 10
        ? originalCheckData.userPhone.trim()
        : false;

    originalCheckData.protocol =
      typeof originalCheckData.protocol === "string" &&
      ["https", "http"].indexOf(originalCheckData.protocol) > -1
        ? originalCheckData.protocol
        : false;

    originalCheckData.url =
      typeof originalCheckData.url === "string" &&
      originalCheckData.url.trim().length > 0
        ? originalCheckData.url.trim()
        : false;

    originalCheckData.method =
      typeof originalCheckData.method === "string" &&
      ["post", "get", "put", "delete"].indexOf(originalCheckData.method) > -1
        ? originalCheckData.method
        : false;

    originalCheckData.successCodes =
      typeof originalCheckData.successCodes === "object" &&
      originalCheckData.successCodes instanceof Array &&
      originalCheckData.successCodes.length > 0
        ? originalCheckData.successCodes
        : false;

    originalCheckData.timeoutSeconds =
      typeof originalCheckData.timeoutSeconds === "number" &&
      originalCheckData.timeoutSeconds % 1 === 0 &&
      originalCheckData.timeoutSeconds >= 1 &&
      originalCheckData.timeoutSeconds <= 5
        ? originalCheckData.timeoutSeconds
        : false;

    // Set the keys that may not be set (if the workers have never seen
    // this checks before)
    originalCheckData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";

    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // If all the checks passed, pass the data along to the next step in the process
    if (
      originalCheckData.id &&
      originalCheckData.userPhone &&
      originalCheckData.protocol &&
      originalCheckData.url &&
      originalCheckData.timeoutSeconds &&
      originalCheckData.method &&
      originalCheckData.successCodes
    ) {
      this.performCheck(originalCheckData);
    } else {
      // If checks fail, log the error and fail silently
      this.debug(
        "Error: One of the checks is not properly formatted. Skipping.."
      );
    }
  }

  /**
   * @desc  Process the check outcome, update the check data as needed,
   * and trigger an alert to user if needed. Don't alert on a check
   * has not been tested before
   *
   * @param {object} originalCheckData
   * @param {object} checkOutcome
   * @returns {void}
   */
  async processCheckOutcome(originalCheckData, checkOutcome) {
    // Decide if the check is considered up or down
    const state =
      !checkOutcome.error &&
      checkOutcome.responseCode &&
      originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
        ? "up"
        : "down";

    // Decide if an alert is warranted
    const alertWarranted =
      originalCheckData.lastChecked && originalCheckData.state !== state
        ? true
        : false;

    // Log the outcome of the check
    const timeOfCheck = Date.now();
    this.log(
      originalCheckData,
      checkOutcome,
      state,
      alertWarranted,
      timeOfCheck
    );

    // Update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = timeOfCheck;

    try {
      await this.data.update("checks", newCheckData.id, newCheckData);

      if (alertWarranted) {
        this.alertUserToStatusChange(newCheckData);
      } else {
        this.debug("Check outcome has not changed. No alert needed");
      }
    } catch (error) {
      this.debug("Error trying to save update to one of the checks");
    }
  }

  /**
   * @desc Alert the user to a change in their check status
   *
   * @param {object} newCheckData
   * @returns {void}
   */
  async alertUserToStatusChange(newCheckData) {}

  /**
   * @desc Perform the checks, send the originalCheckData and the outcome
   * of the check process to the next step in the process.
   *
   * @param {object} originalCheckData
   * @returns {void}
   */
  performCheck(originalCheckData) {}

  /**
   * @desc Log worker to a file
   *
   * @param {object} originalCheckData
   * @param {object} checkOutcome
   * @param {string} state
   * @param {boolean} alertWarranted
   * @param {string} timeOfCheck
   * @returns {void}
   */
  async logWorker(
    originalCheckData,
    checkOutcome,
    state,
    alertWarranted,
    timeOfCheck
  ) {}
}

export default Workers;
