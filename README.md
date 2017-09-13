Sambience
=========

Intro
-----

A music server + web-ui bundle, built for a specific purpose:

After trying out a dozen MPD and Mopidy frontends I was disappointed that none had the usability of foobar2000 (including album shuffle).

This is specifically for setting up a hifi station on an RPI and allowing it to play endlessly through a selection of albums.

### Features

 - Playlist Grouped by Artist + Album
 - Playmodes: Album Shuffle, Song Shuffle, Song Repeat, Default
 - Quickly Scan and Update Files through the UI
 - tabbed playlists

#### Current Limitations

 - no volume control
 - no seeker
 - no streaming external data or streaming through the UI
 - no duplicate songs in one playlist

#### Possible Future Features

- custom sorting/grouping
- custom metadata attributes
- direct metadata writing


Installation
------------

* `npm i sambience` to install dependencies
* `cp settings.sample.json settings.json` and change content as needed depending on your env
* `npm run start` to start the server process

#### CLI

* `node bin/scan.js "PATH"` to scan path for music and add to library
* `node bin/update.js "PATH"` updates files in path, can remove no longer existing files from lib

##### Debugging

Prefix `DEBUG=sambience*` to any command (scanning, starting) to see the debug log