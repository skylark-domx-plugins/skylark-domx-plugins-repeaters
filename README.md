# skylark-domx-plugins-repeaters
The skylark repeater plugin library.

## Dependences

| Project                                                      | Status | Description                                             |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------- |
| [skylark-langx](https://github.com/skylark-langx/skylark-langx) |        | Javascript language extension library                   |
| [skylark-domx](https://github.com/skylark-domx/skylark-domx) |        | An Universal DOM Utility Library                        |
| [skylark-domx-plugins-base](https://github.com/skylark-domx-plugins/skylark-domx-plugins-base) |        | Plugin base Library                   |

## Different builds

builds are in the directory dist.

|                      | build                                   | Description              |
| -------------------- | --------------------------------------- | ------------------------ |
| full                 | skylark-domx-plugins-repeaters-all.js              | included dependences     |
| only                 | skylark-domx-plugins-repeaters.js                  | not included dependences |
| full （development） | uncompressed/skylark-domx-plugins-repeaters-all.js | included dependences     |
| only （development） | uncompressed/skylark-domx-plugins-repeaters.js     | not included dependences |

Please use the "full" version when using this library alone, and use the "only" version when using other skylark libraries.

## Installation

You can get the latest version in many different ways:

- Downloading [a ZIP file from master](https://github.com/skylark-domx-plugins/skylark-domx-plugins-repeaters/archive/master.zip)
- Cloning using Git: `git clone https://github.com/skylark-domx-plugins/skylark-domx-plugins-repeaters.git`
- Installing via NPM: `npm install https://github.com/skylark-domx-plugins/skylark-domx-plugins-repeaters.git --save`

## Building 

- Ensure that Node.js is installed.
- Run npm install https://github.com/skylarkjs/skylark.git -g to ensure slib is installed.
- Run npm install to ensure the required dependencies are installed.
- Run npm run build. The builds will be placed in the dist/ directory.

## License

Released under the [MIT](http://opensource.org/licenses/MIT)