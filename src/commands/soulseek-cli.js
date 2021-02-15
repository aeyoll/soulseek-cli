const chalk = require('chalk');
const slsk = require('slsk-client');
const Search = require('../modules/Search');
const SearchService = require('../services/SearchService');
const DownloadService = require('../services/DownloadService');
const CredentialsService = require('../services/CredentialsService');
const log = console.log;

// Available file modes
const modes = ['mp3', 'flac'];

class SoulseekCli {
  constructor(queries, options) {
    if (queries.length === 0) {
      log(chalk.red('Please add a search query'));
      process.exit(-1);
    }

    if (!modes.includes(options.mode)) {
      log(chalk.red(`--mode is invalid. Valid values: ${modes.join(', ')})`));
      process.exit(-1);
    }

    if (options.mode === 'flac' && options.quality) {
      log(chalk.red('--quality is incompatible with the "flac" mode. Please remove this option.'));
      process.exit(-1);
    }

    this.options = options;
    this.searchService = new SearchService(queries);
    this.downloadService = new DownloadService(this.searchService);
    this.credentialsService = new CredentialsService();
    this.search = null;
    this.connect();
  }

  /**
   * Connect to the Soulseek client
   */
  connect() {
    log(chalk.green('Connecting to soulseek'));
    this.credentialsService.getCredentials().then((credentials) => {
      slsk.connect(
        {
          user: credentials.account,
          pass: credentials.password,
        },
        (err, client) => this.onConnected(err, client)
      );
    });
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
    this.search = new Search(this.searchService, this.downloadService, this.options, client);
    this.search.search();
  }
}

module.exports = SoulseekCli;
