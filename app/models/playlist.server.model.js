'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Playlist Schema
 */
var PlaylistSchema = new Schema({
	user: {
		type: [Schema.ObjectId],
		ref: 'Users'
	},
	collab: Boolean,
	id: String,
	name: String,
	owner: String,
	snapshot_id: String,
	tracks: String,
	track_total: Number
});

mongoose.model('Playlist', PlaylistSchema);
