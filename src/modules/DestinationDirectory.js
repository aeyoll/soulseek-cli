const path = require('path');
const fs = require('fs');
const process = require('process');

module.exports = function (destination) {
  this.destination = destination;

  /**
   * Compute the final destination repository, depending on the "destination" option
   * @param  {string} directory
   * @return {string}
   */
  this.getDestinationDirectory = (directory) => {
    let dir;

    if (this.destination) {
      if (path.isAbsolute(this.destination)) {
        dir = this.destination + '/' + directory;
      } else {
        dir = process.cwd() + '/' + this.destination + '/' + directory;
      }
    } else {
      dir = process.cwd() + '/' + directory;
    }

    createIfNotExist(dir);

    return dir;
  };
};

/**
 * Create a directory if it doesn't exist
 * @param {string} path
 */
let createIfNotExist = (path) => {
  const dirList = path.split('/');
  let buildPath = '';

  for (let i = 0; i < dirList.length; i++) {
    buildPath += dirList[i] + '/';

    if (!fs.existsSync(buildPath)) {
      fs.mkdirSync(buildPath);
    }
  }
};
