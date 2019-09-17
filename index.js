#!/usr/bin/env node

const _        = require('lodash');
const chalk    = require('chalk');
const inquirer = require('inquirer');
const path     = require('path');
const program  = require('commander');
const slsk     = require('slsk-client');
const fs       = require('fs');
const log      = console.log;
const VERSION  = '0.0.1';

program.version(VERSION);

program
  .command('search [query]')
  .description('Search with required query')
  .alias('s')
  .action((query, options) => {
    log(chalk.green('Searching for \'%s\''), query);

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
        res = res.filter(r => r.slots === true && r.speed > 0);

        // Keep only mp3
        res = res.filter(r => path.extname(r.file) === '.mp3');

        // Sort by speed
        res.sort((a, b) => b.speed - a.speed);

        const rawFilesByUser = _.groupBy(res, r => {
          let resFileStructure = r.file.split('\\');
          let resDirectory     = resFileStructure[resFileStructure.length - 2];

          return resDirectory + ' - ' + r.user;
        });

        var filesByUser = {};
        for (const prop in rawFilesByUser) {
          filesByUser[prop + ' (' + rawFilesByUser[prop].length + ' files)'] = rawFilesByUser[prop];
        }

        inquirer.prompt([
          {
            type: 'rawlist',
            name: 'user',
            pageSize: 10,
            message: 'Choose a folder to download?',
            choices: _.keys(filesByUser)
          }
        ]).then((answers) => {
          const chosenUserFiles = filesByUser[answers.user];
          var downloadedFilesCount = 0;

          log('Starting download of ' + chosenUserFiles.length + ' file' + (chosenUserFiles.length > 1 ? 's' : '') + '...');
          nbFileToDl = chosenUserFiles.length;
          chosenUserFiles.forEach(file => {
            const fileStructure = file.file.split('\\');
            const directory     = fileStructure[fileStructure.length - 2];
            const filename      = fileStructure[fileStructure.length - 1];

            const data = {
              file,
              path: __dirname + '/' + directory + '/' + filename
            };

            let dir = __dirname + '/' + directory;
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            if (fs.existsSync(data.path)) {
              log('\t' + filename + chalk.green(' [already downloaded: skipping]'));
              nbFileToDl--;
              if (nbFileToDl === 0) {
                log('No file to download.');
                process.exit();
              }
              return;
            }
            log('\t' + filename + chalk.yellow(' [downloading...]'));
            client.download(data, (err, down) => {
              if (err) {
                log(chalk.red(err));
                process.exit();
              }
              downloadedFilesCount++;
              log('(' + downloadedFilesCount + '/' + nbFileToDl + ') Received: ' + down.path);
              if (downloadedFilesCount === nbFileToDl) {
                log(nbFileToDl + ' file' + (nbFileToDl > 1 ? 's' : '') + ' downloaded.');
                process.exit();
              }
            })
          });
        });
      });
    });
  });

program.parse(process.argv);
