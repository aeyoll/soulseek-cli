import fs from 'fs';
import process from 'process';
import chalk from 'chalk';
import DestinationDirectory from './DestinationDirectory.js';
const log = console.log;

export default function (downloadService, searchService, options, client) {
  this.destinationDirectory = new DestinationDirectory(options.destination);
  this.downloadService = downloadService;
  this.searchService = searchService;
  this.client = client;

  /**
   * Call prepare download method,
   * then launch the download of each files in the list
   *
   * @param {array} files
   */
  this.startDownloads = (files) => {
    this.downloadService.prepareDownload(files);
    files.forEach((file) => this.downloadFile(file));
  };

  /**
   * Download a single file from the selected answer
   *
   * @param file
   */
  this.downloadFile = (file) => {
    const fileStructure = file.file.split('\\');
    const directory = fileStructure[fileStructure.length - 2];
    const filename = fileStructure[fileStructure.length - 1];

    const data = {
      file,
      path: this.destinationDirectory.getDestinationDirectory(directory) + '/' + filename,
    };

    if (this.checkFileExists(data.path, filename)) {
      return;
    }

    log(filename + chalk.yellow(' [downloading...]'));

    this.client.download(data, (err, down) => {
      if (err) {
        log(chalk.red(err));
        process.exit();
      }

      this.downloadService.downloadComplete(down.path);
    });
  };

  this.checkFileExists = (path, filename) => {
    let fileExists = false;

    if (fs.existsSync(path)) {
      log(filename + chalk.green(' [already downloaded: skipping]'));
      this.downloadService.decrementFileCount();

      if (this.searchService.allSearchesCompleted() && this.downloadService.getFileCount() === 0) {
        log('No file to download.');
        process.exit();
      }

      fileExists = true;
    }

    return fileExists;
  };
}
