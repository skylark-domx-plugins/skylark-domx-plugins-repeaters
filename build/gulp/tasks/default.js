var gulp = require('gulp');
var runSequence = require('run-sequence');


module.exports = function(callback) {
	return runSequence(
    	'clean',
    	'style',
    	'script',
    	'minify',
    	'script-all',
    	'minify-all',
    	callback
  	);
};
