'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var SnapTrackSchema = new Schema({
	title: String,
	artist: String,
	uri: String
});

var SnapshotSchema = new Schema({
	id: String,
	created: Date,
	note: String,
	type: String,
	tracks: [SnapTrackSchema]
	});
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
	snapshots:[SnapshotSchema],
	track_total: Number,
});

mongoose.model('Playlist', PlaylistSchema);
mongoose.model('Snapshot', SnapshotSchema);
mongoose.model('SnapTrack', SnapTrackSchema);
