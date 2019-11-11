const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const slsk = require('slsk-client');
const fs = require('fs');
const log = console.log;

class SoulseekCli {
  constructor(query, options) {
    this.query = query;
    this.options = options;
    this.destination = options.destination;
    this.timeout = 2000;
    this.client = null;
    this.filesByUser = {};
    this.downloadFilesCount = 0;
    this.downloadedFilesCount = 0;
    this.connect();
  }

  /**
   * Connect to the Soulseek client
   */
  connect() {
    log(chalk.green('Connecting to soulseek'));

    slsk.connect(
      {
        user: 'username',
        pass: 'password',
      },
      (err, client) => this.onConnected(err, client)
    );
  }

  /**
   * @param  {string}
   * @param  {SlskClient}
   */
  onConnected(err, client) {
    if (err) {
      return log(chalk.red(err));
    }

    log(chalk.green('Connected to soulseek'));

    this.client = client;
    this.search();
  }

  /**
   * Execute the file search
   */
  search() {
    log(chalk.green("Searching for '%s'"), this.query);

    this.client.search(
      {
        req: this.query,
        timeout: this.timeout,
      },
      (err, res) => this.onSearchFinished(err, res)
    );
  }

  /**
   * From the query results, only get mp3 with free slots.
   * The fastest results are going to be first.
   *
   * @param  {array}
   * @return {array}
   */
  filterResults(res) {
    let filesByUser = {};

    // Keep only free slots
    res = res.filter(r => r.slots === true && r.speed > 0);

    // Keep only mp3
    res = res.filter(r => path.extname(r.file) === '.mp3');

    // Sort by speed
    res.sort((a, b) => b.speed - a.speed);

    const rawFilesByUser = _.groupBy(res, r => {
      const resFileStructure = r.file.split('\\');
      const resDirectory = resFileStructure[resFileStructure.length - 2];

      return resDirectory + ' - ' + r.user;
    });

    for (const prop in rawFilesByUser) {
      filesByUser[prop + ' (' + rawFilesByUser[prop].length + ' files)'] = rawFilesByUser[prop];
    }

    return filesByUser;
  }

  /**
   * @param  {string}
   * @param  {array}
   */
  onSearchFinished(err, res) {
    if (err) {
      return log(chalk.red(err));
    }

    this.filesByUser = this.filterResults(res);

    if (_.isEmpty(this.filesByUser)) {
      log(chalk.red('Nothing found'));
      process.exit(-1);
    } else {
      log(chalk.green('Search finished'));
    }

    this.showResults();
  }

  /**
   * Display a list of choices that the user can choose from.
   *
   * @param  {array}
   */
  showResults() {
    log(chalk.green('Displaying search results'));

    const options = {
      type: 'rawlist',
      name: 'user',
      pageSize: 10,
      message: 'Choose a folder to download',
      choices: _.keys(this.filesByUser),
    };

    inquirer.prompt([options]).then(answers => this.processChosenAnswers(answers));
  }

  /**
   * From the user anwser, trigger the download of the folder
   *
   * @param  {array}
   */
  processChosenAnswers(answers) {
    const chosenUserFiles = this.filesByUser[answers.user];

    log(
      chalk.green(
        'Starting download of ' + chosenUserFiles.length + ' file' + (chosenUserFiles.length > 1 ? 's' : '') + '...'
      )
    );
    this.downloadFilesCount = chosenUserFiles.length;
    chosenUserFiles.forEach(file => this.downloadFile(file));
  }

  /**
   * Compute the final destination repository, depending on the "destination" option
   * @param  {string} directory 
   * @return {string}
   */
  getDestinationDirectory(directory) {
    let dir;    
    
    if (this.destination) {
      if (path.isAbsolute(this.destination)) {
        dir = this.destination  + '/' + directory;
      } else {
        dir = __dirname + '/' + this.destination   + '/' + directory;
      }
    } else {
      dir = __dirname + '/' + directory;
    }

    return dir;
  }

  /**
   * Download a single file from the selected anwser
   *
   * @param  {file}
   */
  downloadFile(file) {
    const fileStructure = file.file.split('\\');
    const directory = fileStructure[fileStructure.length - 2];
    const filename = fileStructure[fileStructure.length - 1];

    const data = {
      file,
      path: __dirname + '/' + directory + '/' + filename,
    };

    let dir = this.getDestinationDirectory(directory);

    // Create the directory if it doesn't exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    // If the file is already there, skip the download
    if (fs.existsSync(data.path)) {
      log(filename + chalk.green(' [already downloaded: skipping]'));
      this.downloadFilesCount--;

      if (this.downloadFilesCount === 0) {
        log('No file to download.');
        process.exit();
      }

      return;
    }

    log(filename + chalk.yellow(' [downloading...]'));

    this.client.download(data, (err, down) => {
      if (err) {
        log(chalk.red(err));
        process.exit();
      }

      this.downloadedFilesCount++;
      log('(' + this.downloadedFilesCount + '/' + this.downloadFilesCount + ') Received: ' + down.path);

      if (this.downloadedFilesCount === this.downloadFilesCount) {
        log(this.downloadFilesCount + ' file' + (this.downloadFilesCount > 1 ? 's' : '') + ' downloaded.');
        process.exit();
      }
    });
  }
}

module.exports = SoulseekCli;