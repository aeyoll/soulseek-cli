#!/usr/bin/env node

const _ = require('lodash');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const program = require('commander');
const slsk = require('slsk-client');
const fs = require('fs');
const log = console.log;
const VERSION = '0.0.1';

program.version(VERSION);

class SoulseekCli {
  constructor(query) {
    this.query = query;
    this.timeout = 2000;
    this.client = null;
    this.filesByUser = {};
    this.downloadFilesCount = 0;
    this.downloadedFilesCount = 0;
    this.connect();
  }

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

  onConnected(err, client) {
    if (err) {
      return log(chalk.red(err));
    }

    log(chalk.green('Connected to soulseek'));

    this.client = client;
    this.search();
  }

  search() {
    log(chalk.green("Searching for '%s'"), this.query);

    return this.client.search(
      {
        req: this.query,
        timeout: this.timeout,
      },
      (err, res) => this.onSearchFinished(err, res)
    );
  }

  filterResults(res) {
    const filesByUser = {};

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

  onSearchFinished(err, res) {
    if (err) {
      return log(chalk.red(err));
    }

    log(chalk.green('Search finished'));

    this.filesByUser = this.filterResults(res);
    this.showResults();
  }

  showResults(choices) {
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

  downloadFile(file) {
    const fileStructure = file.file.split('\\');
    const directory = fileStructure[fileStructure.length - 2];
    const filename = fileStructure[fileStructure.length - 1];

    const data = {
      file,
      path: __dirname + '/' + directory + '/' + filename,
    };

    let dir = __dirname + '/' + directory;

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

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

program
  .command('search [query]')
  .description('Search with required query')
  .alias('s')
  .action((query, options) => {
    new SoulseekCli(query);
  });

program.parse(process.argv);
