
<div align="right">
  <details>
    <summary >🌐 Language</summary>
    <div>
      <div align="center">
        <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=en">English</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=zh-CN">简体中文</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=zh-TW">繁體中文</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=ja">日本語</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=ko">한국어</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=hi">हिन्दी</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=th">ไทย</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=fr">Français</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=de">Deutsch</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=es">Español</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=it">Italiano</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=ru">Русский</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=pt">Português</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=nl">Nederlands</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=pl">Polski</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=ar">العربية</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=fa">فارسی</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=tr">Türkçe</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=vi">Tiếng Việt</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=id">Bahasa Indonesia</a>
        | <a href="https://openaitx.github.io/view.html?user=aeyoll&project=soulseek-cli&lang=as">অসমীয়া</
      </div>
    </div>
  </details>
</div>

# Soulseek CLI

[![Build Status](https://travis-ci.org/aeyoll/soulseek-cli.svg?branch=develop)](https://travis-ci.org/aeyoll/soulseek-cli)

A Soulseek Cli client.

Requirements
---

NodeJS >= 20

Installation
---

```sh
npm install -g soulseek-cli
```

### On Linux

One of soulseek-cli dependencies ([node-keytar](https://github.com/atom/node-keytar)) uses libsecret, so you need to install it before running `npm install`.

Depending on your distribution, you will need to run the following command:

- Debian/Ubuntu: `sudo apt-get install libsecret-1-dev`
- Red Hat-based: `sudo yum install libsecret-devel`
- Arch Linux: `sudo pacman -S libsecret`

### On Headless Linux

On Linux, [node-keytar](https://github.com/atom/node-keytar) uses the Linux SecretService API. It is possible to use the SecretService backend on Linux systems without X11 server available (only D-Bus is required). In this case, you can do the following (exemple is on a Debian environment):

#### Install dependencies

```sh
apt install gnome-keyring --no-install-recommends # Install the GNOME Keyring daemon. "no-install-recommends" prevents X11 install
```

#### Usage

```sh
dbus-run-session -- $SHELL # Start a D-Bus session
echo 'root' | /usr/bin/gnome-keyring-daemon -r -d --unlock # Unlock GNOME Keyring
soulseek ... # Use soulseek-cli normally
```

Commands
---

### Login

Before being able to search, you need to be logged in.

Usage:
```
soulseek login
```

You will be prompted your Soulseek login and password. Credentials are stored and encrypted in your system keychain.

Alternatively, you can also login by setting environment variables:

```sh
export SOULSEEK_ACCOUNT=youraccount
export SOULSEEK_PASSWORD=yourpassword
soulseek download "..."
```

### Download

Download with required query.

Usage:
```
soulseek download|d [options] [query...]
```

:warning: This command used to be called `search` in versions prior to 0.1.0.

Options:

| Option                    | Description                                                                   |
| ------------------------- | ----------------------------------------------------------------------------- |
| -d --destination <folder> | downloads's destination                                                       |
| -q --quality <quality>    | show only mp3 with a defined quality                                          |
| -m --mode <mode>          | filter the kind of files you want (available: "mp3", "flac", default: "mp3")  |
| -h --help                 | display help for command                                                      |

Examples:

```sh
soulseek download "Your query" # Download in the current folder
soulseek download "Your query" --destination=/path/to/directory # Download in a defined folder (relative or absolute)
soulseek download "Your query" --quality=320 # Filter by quality
soulseek download "Your query" --mode=flac # Filter by file type
```

### Query

Search with required query, but don't download anything. If a result is found, the return code will be 0. Otherwise,
the return code will be 1 (useful for scripting)

Usage:

```
soulseek query|q [options] [query...]
```

Options:

| Option                 | Description                                                                  |
| ---------------------- | ---------------------------------------------------------------------------- |
| -q --quality <quality> | show only mp3 with a defined quality                                         |
| -m --mode <mode>       | filter the kind of files you want (available: "mp3", "flac", default: "mp3") |
| -h --help              | display help for command                                                     |



Contribution
---

See [CONTRIBUTING.md](CONTRIBUTING.md).
