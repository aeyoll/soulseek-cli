#!/usr/bin/env node

const program = require('commander');
const VERSION = '0.0.20';
const SearchCommand = require('./src/commands/search');
const LoginCommand = require('./src/commands/login');

program.version(VERSION);

program
  .command('search [query...]')
  .description('Search with required query')
  .option('-d, --destination <folder>', 'downloads\'s destination')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .option('-m, --mode <mode>', 'filter the kind of files you want (available: "mp3", "flac", default: "flac")', 'mp3')
  .alias('s')
  .action((queries, options) => {
    new SearchCommand(queries, options);
  });

program
  .command('login')
  .alias('l')
  .action(() => {
    new LoginCommand();
  });

program.parse(process.argv);
