const chalk = require('chalk');
const slsk = require('slsk-client');
const Search = require('./modules/Search');
const SearchService = require('./services/SearchService');
const DownloadService = require('./services/DownloadService');
const log = console.log;

class SoulseekCli {
  constructor(queries, options) {
    this.options = options;
    this.searchService = new SearchService(queries);
    this.downloadService = new DownloadService(this.searchService);
    this.search = null;
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
    this.search = new Search(this.searchService, this.downloadService, this.options, client);
    this.search.search();
  }
}

module.exports = SoulseekCli;
