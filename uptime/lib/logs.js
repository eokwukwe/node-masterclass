import path from "path";
import zlib from "zlib";
import util from "util";
import { promises as fs } from "fs";

/** Library for storing and rotating logs */
class Logs {
  /**
   * Create a data operation instance
   */
  constructor() {
    this.baseDir = path.join(__dirname, "/../.logs");
    this.response = {};
  }

  /**
   * @desc Append a string to the file. Create the file if it does not exist
   * @param {object} file The file to append
   * @param {object} str The JSON object to append to the file
   * @returns {object} Response object
   */
  async append(file, str) {
    try {
      // Open file for appending
      const fileDescriptor = await fs.open(`${this.baseDir}/${file}.log`, "a");

      // Append to the file
      await fs.appendFile(fileDescriptor, `${str}\n`);

      return this.setResponse(true, "Info appended successfully");
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(
          false,
          `The directory ${this.baseDir} does not exist`
        );
      }
      return this.setResponse(false, "Error appending to file");
    }
  }

  /**
   * @desc List all logs
   * @param {boolean} includeCompressedLogs Flag to indicate if compressed logs
   * files will be included in the list of log files
   * @returns {object} Response object
   */
  async list(includeCompressedLogs) {
    try {
      const logFiles = await fs.readdir(this.baseDir);

      let trimmedFileNames = [];

      logFiles.forEach((logFile) => {
        // Add the .log files
        if (logFile.indexOf(".log") > -1) {
          trimmedFileNames.push(logFile.replace(".log", ""));
        }

        // Add on the .gz files if includeCompressedLogs is true
        if (logFile.indexOf(".gz.b64") > -1 && includeCompressedLogs) {
          trimmedFileNames.push(logFile.replace(".gz.b64", ""));
        }
      });

      return this.setResponse(true, "Log files", trimmedFileNames);
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(
          false,
          `The directory ${this.baseDir} does not exist`
        );
      }

      return this.setResponse(false, error.message);
    }
  }

  /**
   * @desc Compress a .log file into a .gz.b64 file
   * @param {string} logId The name of the file to compress.
   * @param {string} newFileId The name of the compressed file
   * @returns {object} Response object
   */
  async compress(logId, newFileId) {
    const gzipPromise = util.promisify(zlib.gzip);
    const sourceFile = `${logId}.log`;
    const destinationFile = `${newFileId}.gz.b64`;

    try {
      const fileContent = await fs.readFile(
        `${this.baseDir}/${sourceFile}`,
        "utf8"
      );

      // Compress the file content
      const zippedFile = await gzipPromise(fileContent);

      // Send the data to the destination file
      const fileDescriptor = await fs.open(
        `${this.baseDir}/${destinationFile}`,
        "wx"
      );

      // Write to the destination file
      await fs.writeFile(fileDescriptor, zippedFile.toString("base64"));

      return this.setResponse(true, "File compresssion successful");
    } catch (error) {
      if (error.code === "EEXIST") {
        return this.setResponse(
          false,
          `File "${destinationFile}" already exists.`
        );
      }

      if (error.code === "ENOENT") {
        return this.setResponse(false, `No such file ${sourceFile}.`);
      }

      return this.setResponse(false, error.message);
    }
  }

  /**
   * @desc Decompress a .gz.b64 file
   * @param {string} fileId The name of the file to compres.
   * @returns {object} Response object
   */
  async decompress(fileId) {
    const unzipPromise = util.promisify(zlib.unzip);
    const fileName = `${fileId}.gz.b64`;

    try {
      const fileContent = await fs.readFile(
        `${this.baseDir}/${fileName}`,
        "utf8"
      );

      // Decompress file data
      const inputBuffer = Buffer.from(fileContent, "base64");
      const outputBuffer = await unzipPromise(inputBuffer);

      return this.setResponse(
        true,
        "Decompress successful",
        outputBuffer.toString()
      );
    } catch (error) {
      return this.setResponse(false, error.message);
    }
  }

  /**
   * @desc Truncate a log file
   * @param {string} logId The name of the file to truncate.
   * @returns {object} Response object
   */
  async truncate(logId) {
    try {
      await fs.truncate(`${this.baseDir}/${logId}.log`, 0);

      return this.setResponse(true, "Truncate successful");
    } catch (error) {
      if (error.code === "ENOENT") {
        return this.setResponse(false, `No such file ${logId}.log.`);
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

(async function () {
  // const gzip = util.promisify(zlib.gzip);

  // const zipped = await gzip("thihs is to compress");
  const nf = new Logs();
  const f = await nf.truncate("append");
  console.log(f);

  // console.log(zipped.toString('base64'));
})();

export default Logs;
