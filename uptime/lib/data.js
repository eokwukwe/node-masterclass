import { promises as fs } from "fs";

import Helpers from "./helpers";

/** Class for file crud operations */
class DataOperations {
  /**
   * Create a data operation instance
   * @param {string} baseDir - The base directory for data storage.
   */
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.response = {};
  }

  /**
   * @desc Save data to file
   * @param {string} dir - The file directory
   * @param {string} fileName - The file to store the data
   * @param {object} data - The data to store in the file
   * @returns {object} The response
   */
  async create(dir, fileName, data) {
    try {
      // Open file for writing
      const fileDescriptor = await fs.open(
        `${this.baseDir}/${dir}/${fileName}.json`,
        "wx"
      );

      await fs.writeFile(fileDescriptor, Helpers.toJson(data));

      return this.setResponse(true, "Data written to file successfully.");
    } catch (error) {
      if (error.code === "ERR_INVALID_ARG_TYPE") {
        return this.setResponse(false, error.message);
      }

      return this.setResponse(false, "File already exists.");
    }
  }

  /**
   * @desc Read data from a file
   * @param {string} dir The file directory
   * @param {string} fileName The name of the file
   * @returns {object} The response
   */
  async read(dir, fileName) {
    try {
      const data = await fs.readFile(
        `${this.baseDir}/${dir}/${fileName}.json`,
        "utf8"
      );

      return this.setResponse(
        true,
        "Data saved sucessfully",
        Helpers.fromJson(data)
      );
    } catch (error) {
      return this.setResponse(false, "No such file or directory.");
    }
  }

  /**
   * @desc Update data inside a file
   * @param {string} dir - The file directory
   * @param {string} fileName - The file to be update
   * @param {object} data - The data to update the file with
   * @returns {object} The response
   */
  async update(dir, fileName, data) {
    try {
      // Open file for writing
      const fileDescriptor = await fs.open(
        `${this.baseDir}/${dir}/${fileName}.json`,
        "r+"
      );

      // Truncate the file
      fileDescriptor.truncate();

      // Update file content
      await fs.writeFile(fileDescriptor, Helpers.toJson(data));

      return this.setResponse(true, "Data updated successfully.");
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(false, "No such file or directory.");
      }

      return this.setResponse(false, error.message);
    }
  }

  /**
   * @desc Delete a file
   * @param {string} dir - The file directory
   * @param {string} fileName - The file to delete
   * @returns {object} The response
   */
  async delete(dir, fileName) {
    try {
      await fs.unlink(`${this.baseDir}/${dir}/${fileName}.json`);

      return this.setResponse(true, "File deleted successfully");
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(false, "No such file or directory.");
      }

      return this.setResponse(false, "Could not delete file");
    }
  }

  /**
   * @desc List all the files in a directory
   * @param {string} dir - The files directory
   * @returns {object} The response
   */
  async list(dir) {
    try {
      // let trimmedFileNames = [];

      const fileNames = await fs.readdir(`${this.baseDir}/${dir}/`);

      // Remove the extension from the file names
      const trimmedFileNames = fileNames.map((fileName) =>
        fileName.replace(".json", "")
      );

      return this.setResponse(
        true,
        "Listing files successful",
        trimmedFileNames
      );
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(false, "No such file or directory.");
      }

      return this.setResponse(false, error.message);
    }
  }

  /**
   * @desc Set the response message
   * @param {boolean} status - Operation status
   * @param {string} message - Response message
   * @param {object|string} data - The data from the operation
   * @returns {object} The response
   */
  setResponse(status, message, data = null) {
    this.response = { success: status, message, data };

    return this.response;
  }
}

export default DataOperations;
