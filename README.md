
# manage-env

> A npm package to manage all your .env data

## Prerequisites

This project requires NodeJS (version 8 or later) and NPM.
[Node](http://nodejs.org/) and [NPM](https://npmjs.org/) are really easy to install.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

## Installation

To install and set up the library, run:

```sh
$ npm install -g manage-env
$ manage-env -v
1.0.0
```

## Usage

### Using the package

```sh
$ manage-env [options] [command]
```

| options | Command | Description |
| --- | --- | --- |
| use | `<envFile>` | Use a specific environment file |
| get | `<key>`  | Get the value for a key |
| set |` <envFile>` | Set the value for a key |
| backup |  | Create a backup of the .env file |
| restore | | Restore the .env file from a backup |
| help | `[command]`| display help for command |

## Authors

* **Anik Das** - *Initial work* - [dasanik2001](https://github.com/dasanik2001)

## License

[MIT License]() 