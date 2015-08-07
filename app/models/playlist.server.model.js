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
	collaborative: Boolean,
	external_url: String,
	images:[{
		type: String
	}],
	id: String,
	name: String,
	owner: String,
	snapshots:[{
		id: String,
		created: Date,
		note: String
	}],
	track_total: Number,
});

mongoose.model('Playlist', PlaylistSchema);
