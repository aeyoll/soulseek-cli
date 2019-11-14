const DownloadLogger = require('../modules/DownloadLogger');
const log = console.log;

module.exports = function(searchService) {
  this.searchService = searchService;
  this.downloadLogger = new DownloadLogger(searchService, this);
  this.downloadingFilesCount = 0;
  this.downloadCompleteCount = 0;

  this.prepareDownload = files => {
    this.downloadLogger.startDownload(files.length);
    this.downloadingFilesCount += files.length;
  };

  this.downloadComplete = downloadPath => {
    this.downloadLogger.downloadComplete(downloadPath, this.downloadingFilesCount);
    this.downloadCompleteCount++;
    this.everyDownloadCompleted();
  };

  this.everyDownloadCompleted = () => {
    if (this.downloadCompleteCount === this.downloadingFilesCount && this.searchService.allSearchesCompleted()) {
      log(this.downloadingFilesCount + ' file' + (this.downloadingFilesCount > 1 ? 's' : '') + ' downloaded.');
      process.exit();
    }
  };

  this.decrementFileCount = () => {
    this.downloadingFilesCount--;
  };

  this.getFileCount = () => {
    return this.downloadingFilesCount;
  };
};
