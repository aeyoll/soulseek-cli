import inquirer from 'inquirer';
import CredentialsService from '../services/CredentialsService.js';

class LoginCommand {
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
      message: 'Login',
    };
    const pwdQuestion = {
      type: 'password',
      name: 'pwd',
      message: 'Password',
    };
    inquirer.prompt(loginQuestion).then((loginAnswer) => {
      inquirer.prompt(pwdQuestion).then((pwdAnswer) => {
        this.credentialsService.storeCredentials(loginAnswer.login, pwdAnswer.pwd);
      });
    });
  }
}

export default LoginCommand;
