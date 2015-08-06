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
	users: [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	collaborative: Boolean,
	id: String,
	name: String,
	owner: String,
	snapshot_id:[{
		id: String,
		created: Date,
		note: String
	}],
	tracks_link: String,
	track_total: Number,
	tracks: [{
		type: Schema.Types.ObjectId,
		ref: 'Track'
	}],
});

mongoose.model('Playlist', PlaylistSchema);
