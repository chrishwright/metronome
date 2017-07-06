metronomeApp.service('FormService', function() {

    var artist,
        tempo,
        song_title,
        trackInfo = {};

    this.updateMap = function(songInfo) {
        trackInfo[songInfo.id] = {
            title: songInfo.name,
            tempo: songInfo.tempo,
            album: songInfo.album,
            artist: songInfo.artist
        };
    };

    this.getKeys = function() {
        return trackInfo;
    };

    this.clearTrackInfo = function() {
        trackInfo = {};
    }

    this.getTrackInfo = function(id) {
        return trackInfo[id];
    };

    this.updateTrackInfo = function(id, tempo) {
        trackInfo[id].tempo = tempo;
    }

    this.setArtist = function(sArtist) {
        artist = sArtist;
    };

    this.getArtist = function() {
        return artist;
    };

    this.setSongTitle = function(songTitle) {
        song_title = songTitle;
    };

    this.getSongTitle = function() {
        return song_title;
    };

    this.setTempo = function(sTempo) {
        tempo = sTempo;
    };

    this.getTempo = function() {
        return tempo;
    };

});

metronomeApp.service('SubdivService', function() {

    var self = this;
    self.noteIndex = 0;

    self.notes = [
        { label: 'quarter', selected: true },
        { label: 'eighth', selected: false },
        { label: 'sixteenth', selected: false }
    ]

    self.getNotes = function() {
        return self.notes;
    }

    self.getSelectedNote = function() {
        return self.notes[self.noteIndex];
    }

    self.changeSubDiv = function() {
            self.noteIndex = (self.noteIndex + 1) % (self.notes.length);
            switch (self.noteIndex) {
                case 0:
                    self.subDiv('quarter');
                    break;
                case 1:
                    self.subDiv('eighth');
                    break;
                case 2:
                    self.subDiv('sixteenth');
                    break;
            }
        } //end method changeSubDiv

    self.subDiv = function(value) {

        switch (value) {
            case 'quarter':
                subdivision = 1;
                self.notes[0].selected = true;
                self.notes[1].selected = false;
                self.notes[2].selected = false;
                meter = 4;
                strongBeat = 1;
                weakBeat = 2;
                break;
            case 'eighth':
                subdivision = 2;
                self.notes[0].selected = false;
                self.notes[1].selected = true;
                self.notes[2].selected = false;
                meter = 8;
                strongBeat = 1;
                weakBeat = 2;
                break;
            case 'sixteenth':
                subdivision = 4;
                self.notes[0].selected = false;
                self.notes[1].selected = false;
                self.notes[2].selected = true;
                meter = 4;
                strongBeat = 1;
                weakBeat = 2;
        }
    }; //end method subDiv
});