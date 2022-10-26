import DownloadCommand from './download.js';
import Search from '../modules/Search.js';

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

export default QueryCommand;
