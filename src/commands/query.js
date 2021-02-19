const DownloadCommand = require('./download');
const Search = require('../modules/Search');

class QueryCommand extends DownloadCommand {
  /**
   * @param {SlskClient} client
   */
  onConnected(client) {
    const queryOptions = {
      showPrompt: false,
    };
    this.search = new Search(this.searchService, this.downloadService, { ...this.options, ...queryOptions }, client);
    this.search.search();
  }
}

module.exports = QueryCommand;
