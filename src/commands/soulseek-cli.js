const chalk = require('chalk');
const slsk = require('slsk-client');
const Search = require('../modules/Search');
const SearchService = require('../services/SearchService');
const DownloadService = require('../services/DownloadService');
const CredentialsService = require('../services/CredentialsService');
const log = console.log;

class SoulseekCli {
  constructor(queries, options) {
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
          pass: credentials.password
        },
        (err, client) => this.onConnected(err, client)
      );
    })
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
