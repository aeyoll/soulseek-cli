# Soulseek CLI

[![Build Status](https://travis-ci.org/aeyoll/soulseek-cli.svg?branch=develop)](https://travis-ci.org/aeyoll/soulseek-cli)

A Soulseek Cli client.

Installation
---

```sh
npm install -g soulseek-cli
```

Commands
---

### Login

Before beeing able to search, you need to be logged in.

Usage:
```
soulseek login
```

You will be prompted your Soulseek login and password. Credentials are stored and encrypted in your system keychain.

### Search

Search with required query.

Usage:

```
soulseek search|s [options] [query...]
```

Options:

| Option                    | Description                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| -d --destination <folder> | downloads's destination                                                                        |
| -q --quality <quality>    | show only mp3 with a defined quality                                                           |
| -m --mode <mode>          | filter the kind of files you want (available: "mp3", "flac", default: "mp3")                   |
| -h --help                 | display help for command                                                                       |

Examples:

```sh
soulseek search "Your query" # Download in the current folder
soulseek search "Your query" --destination=/path/to/directory # Download in a defined folder (relative or absolute)
soulseek search "Your query" --quality=320 # Filter by quality
soulseek search "Your query" --mode=flac # Filter by file type
```


Contribution
---

See [CONTRIBUTING.md](CONTRIBUTING.md).
