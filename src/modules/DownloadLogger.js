const chalk = require('chalk');
const log = console.log;

module.exports = function (searchService, downloadService) {
  this.searchService = searchService;
  this.downloadService = downloadService;
  this.logBuffer = '';
  this.fileIndex = 0;

  /**
   * Display a line in the terminal showing the number of the downloaded file, the total number of file to download and the path to the downloaded file.
   * @param  {string} path Path of the downloaded file
   */
  this.downloadComplete = (path) => {
    this.fileIndex++;
    let logInfo = '(' + this.fileIndex + '/{{totalFileCount}}) Received: ' + path;
    if (this.searchService.allSearchesCompleted()) {
      logInfo = logInfo.replace(/{{totalFileCount}}/g, this.downloadService.getFileCount());
      log(logInfo);
    } else {
      this.logBuffer += logInfo + '\n';
    }
  };

  /**
   * Write in the terminal every lines stored in the buffer, then reset it to empty string.
   */
  this.flush = () => {
    if (this.logBuffer.length > 0) {
      this.logBuffer = this.logBuffer.replace(/{{totalFileCount}}/g, this.downloadService.getFileCount()).slice(0, -1);
      log(this.logBuffer);
      this.logBuffer = '';
    }
  };

  /**
   * Writen a line summing the number of file starting to download.
   * @param  {number} fileCount Number of files
   */
  this.startDownload = (fileCount) => {
    log(chalk.green('Starting download of ' + fileCount + ' file' + (fileCount > 1 ? 's' : '') + '...'));
  };
};
