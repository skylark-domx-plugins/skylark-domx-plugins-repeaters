var gutil = require('gulp-util');


var pkg = require('../../../package.json');
var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

module.exports = {
    src: '../src/',
    lib_langx: '../node_modules/skylark-langx/dist/',
    lib_utils: '../node_modules/skylark-utils/dist/',
    lib_utils_interact: '../node_modules/skylark-utils-interact/dist/',
    lib_ui_fuelux: '../node_modules/skylark-fuelux/dist/',
    lib_ui_repeater: '../node_modules/skylark-ui-repeater/dist/',
    dest: '../dist/',
    banner: banner,
    allinoneHeader : './scripts/allinone-js.header',
    allinoneFooter : './scripts/allinone-js.footer',
    pkg: pkg
};
