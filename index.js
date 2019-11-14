#!/usr/bin/env node

const program = require('commander');
const VERSION = '0.0.6';
const SoulseekCli = require('./src/soulseek-cli');

program.version(VERSION);

program
  .command('search [query...]')
  .description('Search with required query')
  .option('-d, --destination <folder>', 'downloads\'s destination')
  .option('-q, --quality <quality>', 'show only mp3 with a defined quality')
  .alias('s')
  .action((queries, options) => {
    new SoulseekCli(queries, options);
  });

program.parse(process.argv);
