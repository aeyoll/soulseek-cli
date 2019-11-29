# Soulseek CLI

A Soulseek Cli client.

Installation
---

```sh
git clone https://github.com/aeyoll/soulseek-cli.git
cd soulseek-cli
npm install
```

Usage
---

First, you need to be logged in:


```sh
node index.js login
```

You will be prompted your Soulseek login and password. Credentials are stored and encrypted in your system keychain.

Then to perform a search:


```sh
node index.js search "Your query" # Download in the current folder
node index.js search "Your query" --destination=/path/to/directory # Download in a defined folder (relative or absolute)
node index.js search "Your query" --quality=320 # Filter by quality
```

Contribution
---

See [CONTRIBUTING.md](CONTRIBUTING.md).
