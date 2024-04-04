import inquirer from 'inquirer';
import _ from 'lodash';
import chalk from 'chalk';
import FilterResult from './FilterResult.js';
import Download from './Download.js';
const log = console.log;

export default function (searchService, downloadService, options, client) {
  this.download = new Download(downloadService, searchService, options, client);
  this.filterResult = new FilterResult(options.quality, options.mode);
  this.searchService = searchService;
  this.downloadService = downloadService;
  this.client = client;
  this.timeout = options.timeout ?? 2000;
  this.showPrompt = options.showPrompt ?? true;

  /**
   * Launch search query, then call a callback
   */
  this.search = () => {
    const query = this.searchService.getNextQuery();
    log(chalk.green("Searching for '%s'"), query);
    const searchParam = {
      req: query,
      timeout: this.timeout,
    };
    const afterSearch = (err, res) => this.onSearchFinished(err, res);
    this.client.search(searchParam, afterSearch);
  };

  /**
   * Callback called when the search query get back
   */
  this.onSearchFinished = (err, res) => {
    if (err) {
      return log(chalk.red(err));
    }

    const filesByUser = this.filterResult.filter(res);
    this.checkEmptyResult(filesByUser);

    if (this.showPrompt) {
      this.showResults(filesByUser);
    } else {
      this.showTopResult(filesByUser);
      process.exit(0);
    }
  };

  /**
   * If the result set is empty and there is no pending searches quit the process.
   * If there is pending searches, launch the next search.
   * If the result set is not empty just log success message.
   */
  this.checkEmptyResult = (filesByUser) => {
    if (_.isEmpty(filesByUser)) {
      log(chalk.red('Nothing found'));
      this.searchService.consumeQuery();

      if (this.searchService.allSearchesCompleted()) {
        process.exit(1);
      }

      this.search();
    } else {
      log(chalk.green('Search finished'));
    }
  };

  /**
   * Display the top result
   *
   * @param {array} filesByUser
   */
  this.showTopResult = (filesByUser) => {
    const numResults = Object.keys(filesByUser).length;

    if (numResults > 0) {
      const topResult = String(_.keys(filesByUser)[0]);
      log(chalk.green('Search returned ' + numResults + ' results'));
      log(chalk.blue('Top result: %s'), topResult);
    }
  };

  /**
   * Display a list of choices that the user can choose from.
   *
   * @param {array} filesByUser
   */
  this.showResults = (filesByUser) => {
    const numResults = Object.keys(filesByUser).length;

    log(chalk.green('Displaying ' + numResults + ' search results'));

    const question = {
      type: 'rawlist',
      name: 'user',
      pageSize: 10,
      message: 'Choose a folder to download',
      choices: _.keys(filesByUser),
    };
    const promptAction = options.file ? this.showFolderFiles : this.processChosenAnswers;
    inquirer.prompt([question]).then((answers) => promptAction(answers, filesByUser));
  };

  this.showFolderFiles = (answers, filesByUser) => {
    const userFiles = filesByUser[answers.user];
    const fileChoices = userFiles.map((file) => {
      const splitParts = file.file.split('\\');
      const formattedName = splitParts[0] + '\\' + splitParts[1] + '-' + splitParts[splitParts.length - 1];
      return {
        name: formattedName,
        value: file,
      };
    });
    log(fileChoices);
    log(chalk.green('Displaying ' + userFiles.length + ' files for user ' + answers.user));

    const options = {
      type: 'checkbox',
      name: 'files',
      pageSize: 10,
      message: 'Choose files to download',
      choices: fileChoices,
    };
    inquirer.prompt([options]).then((answers) => this.processChosenAnswers(answers, filesByUser));
  };
  /**
   * From the user answer, trigger the download of the folder
   * If there is pending search, launch the next search query
   *
   * @param {array} answers
   * @param filesByUser
   */
  this.processChosenAnswers = (answers, filesByUser) => {
    this.searchService.consumeQuery();
    const filesToDownload = options.file ? answers.files : filesByUser[answers.user];
    this.download.startDownloads(filesToDownload);
    if (this.searchService.allSearchesCompleted()) {
      this.downloadService.downloadLogger.flush();
      this.downloadService.everyDownloadCompleted();
    } else {
      this.search();
    }
  };
}
