'use strict';

module.exports = function(app) {
	var playlists = require('../../app/controllers/playlists.server.controller');

	app.route('/playlists/list')
		.get(playlists.list);

	app.route('/playlist/add')
		.post(playlists.create);

	app.route('/playlist/add/tracks')
		.post(playlists.addTracks);


};
