#!/usr/bin/env node

const program = require('commander');
const VERSION = '0.1.2';
const DownloadCommand = require('./src/commands/download');
const QueryCommand = require('./src/commands/query');
const LoginCommand = require('./src/commands/login');

program.version(VERSION);

program
  .command('download [query...]')
  .description('Download with required query')
  .option('-d, --destination <folder>', 'downloads\'s destination')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .option('-m, --mode <mode>', 'filter the kind of files you want (available: "mp3", "flac", default: "flac")', 'mp3')
  .alias('d')
  .action((queries, options) => {
    new DownloadCommand(queries, options);
  });

program
  .command('query [query...]')
  .description('Search with required query, but don\'t download anything')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .option('-m, --mode <mode>', 'filter the kind of files you want (available: "mp3", "flac", default: "flac")', 'mp3')
  .alias('q')
  .action((queries, options) => {
    new QueryCommand(queries, options);
  });

program
  .command('login')
  .alias('l')
  .action(() => {
    new LoginCommand();
  });

program.parse(process.argv);
