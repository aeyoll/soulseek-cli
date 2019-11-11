#!/usr/bin/env node

const program = require('commander');
const VERSION = '0.0.2';
const SoulseekCli = require('./src/soulseek-cli');

program.version(VERSION);

program
  .command('search [query]')
  .description('Search with required query')
  .option('-d, --destination <folder>', 'downloads\'s destination')
  .alias('s')
  .action((query, options) => {
    new SoulseekCli(query, options);
  });

program.parse(process.argv);
