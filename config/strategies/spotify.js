'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	url = require('url'),
	SpotifyStrategy = require('passport-spotify').Strategy,
	config = require('../config'),
	users = require('../../app/controllers/users.server.controller'),
	refresh = require('passport-oauth2-refresh');

module.exports = function() {
	// Use spotify strategy
  var strategy = (new SpotifyStrategy({
      clientID: config.spotify.clientID,
      clientSecret: config.spotify.clientSecret,
      callbackURL: config.spotify.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
			// Set the provider data and include tokens
			var providerData = profile._json;
			providerData.accessToken = accessToken;
			providerData.refreshToken = refreshToken;

			// Create the user OAuth profile
			var providerUserProfile = {
				displayName: profile.displayName,
				username: profile.username,
				provider: 'spotify',
				providerIdentifierField: 'id_str',
				providerData: providerData
			};

			// Save the user OAuth profile
			users.saveOAuthUserProfile(req, providerUserProfile, done);
		}
  ));

	passport.use(strategy);
	refresh.use(strategy);
};
