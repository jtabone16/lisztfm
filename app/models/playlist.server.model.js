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
	users: {
		type: [Schema.ObjectId],
		ref: 'Users'
	},
	collab: Boolean,
	id: String,
	name: String,
	owner: String,
	snapshot_id:{
		type:[String]
	},
	tracks_link: String,
	track_total: Number,
	tracks: {
		type: [Schema.ObjectId],
		ref: 'Tracks'
	},
});

mongoose.model('Playlist', PlaylistSchema);
