#!/usr/bin/env node

const _        = require('lodash');
const chalk    = require('chalk');
const inquirer = require('inquirer');
const path     = require('path');
const program  = require('commander');
const slsk     = require('slsk-client');
const log      = console.log;
const VERSION  = '0.0.1';

program.version(VERSION);

program
  .command('search [query]')
  .description('Search with required query')
  .alias('s')
  .action((query, options) => {
    log(chalk.green('Searching for "%s"'), query);

    slsk.connect({
      user: 'username',
      pass: 'password'
    }, (err, client) => {
      client.search({
        req: query,
        timeout: 2000
      }, (err, res) => {
        if (err) {
          return log(chalk.red(err));
        }

        // Keep only free slots
        res.filter(r => r.slots === true && r.speed > 0);

        // Keep only mp3
        res.filter(r => path.extname(r.file) === '.mp3');

        // Sort by speed
        res.sort((a, b) => b.speed - a.speed);

        const filesByUser = _.groupBy(res, r => {
          let resFileStructure = r.file.split('\\');
          let resDirectory     = resFileStructure[resFileStructure.length - 2];

          return resDirectory + ' - ' + r.user;
        });

        inquirer.prompt([
          {
            type: 'rawlist',
            name: 'user',
            message: 'Choose a folder to download?',
            choices: _.keys(filesByUser)
          }
        ]).then((answers) => {
          const chosenUserFiles = filesByUser[answers.user];

          chosenUserFiles.forEach(file => {
            const fileStructure = file.file.split('\\');
            const directory     = fileStructure[fileStructure.length - 2];
            const filename      = fileStructure[fileStructure.length - 1];

            const data = {
              file,
              path: __dirname + '/' + directory + '/' + filename
            };

            client.download(data, (err, down) => {
              if (err) {
                log(chalk.red(err));
                process.exit();
              }

              log(down);
            })
          });
        });
      });
    });
  });

program.parse(process.argv);
