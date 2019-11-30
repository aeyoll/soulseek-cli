# Soulseek CLI

[![Build Status](https://travis-ci.org/aeyoll/soulseek-cli.svg?branch=develop)](https://travis-ci.org/aeyoll/soulseek-cli)

A Soulseek Cli client.

Installation
---

```sh
npm install -g soulseek-cli
```

Usage
---

First, you need to be logged in:


```sh
soulseek login
```

You will be prompted your Soulseek login and password. Credentials are stored and encrypted in your system keychain.

Then to perform a search:


```sh
soulseek search "Your query" # Download in the current folder
soulseek search "Your query" --destination=/path/to/directory # Download in a defined folder (relative or absolute)
soulseek search "Your query" --quality=320 # Filter by quality
```

Contribution
---

See [CONTRIBUTING.md](CONTRIBUTING.md).
