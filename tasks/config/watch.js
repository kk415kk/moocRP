/**
 * Run predefined tasks whenever watched file patterns are added, changed or deleted.
 *
 * ---------------------------------------------------------------
 *
 * Watch for changes on
 * - files in the `assets` folder
 * - the `tasks/pipeline.js` file
 * and re-run the appropriate tasks.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-watch
 *
 */
module.exports = function(grunt) {

	grunt.config.set('watch', {
		api: {

			// API files to watch:
			files: ['api/**/*']
		},
		assets: {

			// Assets to watch:
			files: ['assets/**/*', 'tasks/pipeline.js'],

			// When assets are changed:
			tasks: ['syncAssets' , 'linkAssets']
		},

		// datasets: {
		// 	// Datasets to watch
		// 	files: ['../datasets/non_pii/**/**', '../datasets/pii/**/**'],

		// 	// To-do when new datasets are added:
		// 	tasks: ['extractDatasets'],

		// 	// Only when datasets are *added*
		// 	options: {
		// 		events: ['added', 'changed']
		// 	}
		// }
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
};
