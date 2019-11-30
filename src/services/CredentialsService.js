const keytar = require('keytar');
const err = console.error;
const chalk = require('chalk');

module.exports = function() {
  this.serviceName = 'soulseek-cli';

  /**
   * Store credential in the OS keychain
   *
   * @param  {string}
   * @param  {string}
   */
  this.storeCredentials = (login, pwd) => {
    keytar.findCredentials(this.serviceName).then(oldCredentials => {
      if (oldCredentials.length === 0) {
        keytar.setPassword(this.serviceName, login, pwd);
        return;
      }
      keytar.deletePassword(this.serviceName, oldCredentials[0].account).then(() => {
        keytar.setPassword(this.serviceName, login, pwd);
      });
    });
  };

  /**
   * Fetchs credential from OS keychain
   *
   * @return  {Promise<{account: string; password: string;}>}
   */
  this.getCredentials = () => {
    return new Promise(resolve => {
      keytar.findCredentials(this.serviceName).then(credentials => {
        if (credentials.length === 0) {
          err(chalk.red('No credential found for soulseek-cli, please login.'));
          process.exit();
        }
        resolve(credentials[0]);
      });
    });
  };
};
