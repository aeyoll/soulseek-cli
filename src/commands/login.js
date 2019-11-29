const inquirer = require('inquirer');
const CredentialsService = require('../services/CredentialsService');

class Login {
  constructor() {
    this.credentialsService = new CredentialsService();
    this.askCredentials();
  }

  /**
   * Ask for credentials
   */
  askCredentials() {
    const loginQuestion = {
      type: 'input',
      name: 'login',
      message: 'Login'
    };
    const pwdQuestion = {
      type: 'input',
      name: 'pwd',
      message: 'Password'
    };
    inquirer.prompt(loginQuestion).then((loginAnswer) => {
        inquirer.prompt(pwdQuestion).then((pwdAnswer) => {
            this.credentialsService.storeCredentials(loginAnswer.login, pwdAnswer.pwd);
        });
    });
  }
}

module.exports = Login;