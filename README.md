# skylark-ui-repeater
The skylark repeater widget library.

## Dependences

| Project                                                      | Status | Description                                             |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------- |
| [skylark-langx](https://github.com/skylarklangx/skylark-langx) |        | Javascript language extension library                   |
| [skylark-utils](https://github.com/skylarkutils/skylark-utils) |        | An Universal HTML5 Javascript Library                   |
| [skylark-bootstrap3](https://github.com/skylarkui/skylark-bootstrap3) |        | The skylark bootstrap3 widgets                          |
| [skylark-fuelux](https://github.com/skylarkui/skylark-fuelux) |        | A version of fuelux that ported to running on skylarkjs |
| [skylark-utils-dom](https://github.com/skylarkutils/skylark-utils-dom) |        | An Universal DOM Utility Library                        |

## Different builds

builds are in the directory dist.

|                      | build                                   | Description              |
| -------------------- | --------------------------------------- | ------------------------ |
| full                 | skylark-ui-repeater-all.js              | included dependences     |
| only                 | skylark-ui-repeater.js                  | not included dependences |
| full （development） | uncompressed/skylark-ui-repeater-all.js | included dependences     |
| only （development） | uncompressed/skylark-ui-repeater.js     | not included dependences |

Please use the "full" version when using this library alone, and use the "only" version when using other skylark libraries.

## Installation

You can get the latest version in many different ways:

- Downloading [a ZIP file from master](https://github.com/skylarkui/skylark-ui-repeater/archive/master.zip)
- Cloning using Git: `git clone https://github.com/skylarkui/skylark-ui-repeater.git`
- Installing via NPM: `npm install https://github.com/skylarkui/skylark-ui-repeater.git#master --save`

## Building 

- Ensure that Node.js is installed.
- Run npm install https://github.com/skylarkjs/skylark-bundle-cli.git -g to ensure sbundle is installed.
- Run npm install to ensure the required dependencies are installed.
- Run npm run build. The builds will be placed in the dist/ directory.

## License

Released under the [MIT](http://opensource.org/licenses/MIT)