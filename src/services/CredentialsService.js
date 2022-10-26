import slsk from 'slsk-client';
import keytar from 'keytar';
import chalk from 'chalk';
const err = console.error;
const log = console.log;

export default function () {
  this.serviceName = 'soulseek-cli';

  /**
   * Store credential in the OS keychain
   *
   * @param {string} login
   * @param {string} pwd
   */
  this.storeCredentials = (login, pwd) => {
    keytar.findCredentials(this.serviceName).then((oldCredentials) => {
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
   * Fetch credential from OS keychain
   *
   * @return  {Promise<{account: string; password: string;}>}
   */
  this.getCredentials = () => {
    return new Promise((resolve) => {
      const account = process.env.SOULSEEK_ACCOUNT;
      const password = process.env.SOULSEEK_PASSWORD;

      if (account !== undefined && password !== undefined) {
        resolve({
          account,
          password,
        });
      } else {
        keytar.findCredentials(this.serviceName).then((credentials) => {
          if (credentials.length === 0) {
            err(chalk.red('No credential found for soulseek-cli, please login.'));
            process.exit();
          }

          resolve(credentials[0]);
        });
      }
    });
  };

  /**
   * Connect to the Soulseek client
   */
  this.connect = (callback) => {
    log(chalk.green('Connecting to soulseek'));
    this.getCredentials().then((credentials) => {
      slsk.connect(
        {
          user: credentials.account,
          pass: credentials.password,
        },
        (err, client) => {
          if (err) {
            return log(chalk.red(err));
          }

          log(chalk.green('Connected to soulseek'));
          callback(client);
        }
      );
    });
  };
}
