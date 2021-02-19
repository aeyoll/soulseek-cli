const chalk = require('chalk');
const Search = require('../modules/Search');
const SearchService = require('../services/SearchService');
const DownloadService = require('../services/DownloadService');
const CredentialsService = require('../services/CredentialsService');
const log = console.log;

// Available file modes
const modes = ['mp3', 'flac'];

class SearchCommand {
  constructor(queries, options) {
    if (queries.length === 0) {
      log(chalk.red('Please add a search query'));
      process.exit(1);
    }

    if (!modes.includes(options.mode)) {
      log(chalk.red(`--mode is invalid. Valid values: ${modes.join(', ')})`));
      process.exit(1);
    }

    if (options.mode === 'flac' && options.quality) {
      log(chalk.red('--quality is incompatible with the "flac" mode. Please remove this option.'));
      process.exit(1);
    }

    this.options = options;
    this.searchService = new SearchService(queries);
    this.downloadService = new DownloadService(this.searchService);
    this.search = null;

    this.credentialsService = new CredentialsService();
    this.credentialsService.connect(this.onConnected.bind(this));
  }

  /**
   * @param {SlskClient} client
   */
  onConnected(client) {
    this.search = new Search(this.searchService, this.downloadService, this.options, client);
    this.search.search();
  }
}

module.exports = SearchCommand;
