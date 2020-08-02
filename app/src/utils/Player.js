import React from 'react';
import Api from "../api";
import {Platform} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import {offlineSchema, trackSchema} from "../store/realmSchema";
import {TRACK_PLAY_ACCESS} from "../config";
const Realm = require('realm');
export default class Player {
    service = null;
    track = null;
    trackId = null;
    type = null;
    typeId = null;
    component = null;
    isPaused = false;
    playing = false;
    actualPlaying = false;
    eventsListened = false;
    currentPlayList = null;
    currentPlayListLimit = null;
    currentPlayListOffset = null;
    currentPlayIndex = null;
    constructor(comp) {
        this.component = comp;
    }

    prepare() {
        TrackPlayer.reset();
        TrackPlayer.destroy();
        this.actualPlaying = false;
        //console.log('Player preparing');
        TrackPlayer.setupPlayer({
            stopWithApp: true,
            capabilities: [
                TrackPlayer.CAPABILITY_PLAY,
                TrackPlayer.CAPABILITY_PAUSE,
                TrackPlayer.CAPABILITY_STOP,
                TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                TrackPlayer.CAPABILITY_SEEK_TO
            ],
            compactCapabilities: [
                TrackPlayer.CAPABILITY_PLAY,
                TrackPlayer.CAPABILITY_PAUSE,
                TrackPlayer.CAPABILITY_STOP,
                TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
                TrackPlayer.CAPABILITY_SKIP_TO_NEXT
            ]
        }).then(() => {
            // The player is ready to be used
            //console.log('player ready')
            TrackPlayer.updateOptions({
                stopWithApp: true,
                capabilities: [
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    TrackPlayer.CAPABILITY_STOP,
                    TrackPlayer.CAPABILITY_SEEK_TO,
                    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS
                ],
                notificationCapabilities:[
                    TrackPlayer.CAPABILITY_PLAY,
                    TrackPlayer.CAPABILITY_PAUSE,
                    TrackPlayer.CAPABILITY_STOP,
                    TrackPlayer.CAPABILITY_SEEK_TO,
                    TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
                    TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS
                ]
            });


            if (!this.eventsListened) {
                TrackPlayer.addEventListener('remote-play', async (data) => {this.event('play')});
                TrackPlayer.addEventListener('remote-pause', async (data) => {this.event('pause')});
                TrackPlayer.addEventListener('remote-stop', async (data) => {this.event('stop')});
                TrackPlayer.addEventListener('remote-next', async (data) => {this.event('next')});
                //TrackPlayer.addEventListener('playback-state', async (data) => {this.event('state')});
                TrackPlayer.addEventListener('remote-previous', async (data) => {this.event('previous')});
                TrackPlayer.addEventListener('remote-seek', async (data) => {this.event('seek')});
                TrackPlayer.addEventListener('playback-queue-ended', async (data) => {this.event('end')});
                this.eventsListened = true;
            }


            Realm.open({schema: [trackSchema]})
                .then(realm => {
                    let tracks = realm.objects('track_download').filtered('id="' + parseInt(this.track.id)+'"');
                    let url = this.track.streamurl;
                    if (tracks.length > 0) {
                        let track = tracks[0];
                        url =  "file:///" + track.file;
                        //console.log("localfile -" + url);
                    }

                    var track = {
                        id: this.track.id, // Must be a string, required
                        url: url, // Load media from the network
                        title: this.track.title,
                        artist: this.track.reposter.full_name,
                        album: this.track.title,
                        genre: '',
                        date: '2014-05-20T07:00:00+00:00', // RFC 3339
                        artwork: this.track.art, // Load artwork from the network

                    };
                    //console.log(url);
                    TrackPlayer.add([track]).then(() => {
                        // The tracks were adde
                        //this.actualPlaying = true;
                        try{
                            TrackPlayer.play();
                        } catch (e) {
                           // console.log(e);
                        }
                    });

                });
        }).catch((e) => {
            //console.log('Error preparing')
        });


    }

    updateComponent(comp) {
        this.component = comp;
    }

    togglePlay() {
        if (this.component.state.isPaused) {
            //this.service.togglePlayPause();
            //console.log('Play initiated');
            TrackPlayer.play();
            this.playing = true;
            this.isPaused = false;
            this.component.updateState({isPaused: !this.component.state.isPaused})
        } else {
           // this.service.togglePlayPause();
            //console.log('Paused initiated');
            TrackPlayer.pause();
            this.playing = true;
            this.isPaused = true;
            this.component.updateState({isPaused: !this.component.state.isPaused})
        }
    }

    pausePlayer() {
        TrackPlayer.pause();
        this.playing = true;
        this.isPaused = true;
        this.component.updateState({isPaused:true})
    }
    startPlaying() {
        setTimeout(() => {
            try{
                this.component.updateState({playing : true});
            } catch (e){}
            //this.service.togglePlayPause();
            TrackPlayer.play();
            this.playing = true;
            this.isPaused = false;
        }, 1000)
    }

    stopPlaying() {
        try{
            //console.log('trackStart1');
            //this.actualPlaying = true;
            this.component.updateState({isPaused : false, playing: false});
            //this.service.stop();
            this.playing = false;
            this.isPaused = false;
            //MusicControl.stopControl();

            TrackPlayer.stop();
            //console.log('Stop initiated');
        } catch (e){}
    }

    setTrack(track,type,typeId) {
        this.track = track;
        this.type = type;
        this.typeId = typeId;

        if (this.track.canPlay === 0) {
            if (TRACK_PLAY_ACCESS === 2) {
                //we don't ave option than to next
               // this.goNext();
            }
        }
    }

    event(event) {
        if (event === 'play') {
            this.togglePlay();
            this.component.updateState({isPaused: false})
        } else if(event === 'pause') {
            this.pausePlayer();
        } else if (event === 'stop') {
            this.stopPlaying();
            this.pausePlayer();
            TrackPlayer.reset();
            TrackPlayer.destroy();
        } else if (event === 'next') {
            this.goNext();
        } else if (event === 'previous') {
            this.goPrevious();
        } else if(event === 'end') {
            console.log('end event occurred')
            if (this.actualPlaying){
                console.log('actual playing is here')
                this.goNext();
            } else {
                if (Platform.OS === 'ios') {
                    this.goNext();
                }
                this.actualPlaying = true;
            }
        }
    }

    goNext() {
        console.log('next event occurred');
        this.currentPlayIndex = this.currentPlayIndex + 1;
        //console.log(this.currentPlayList);
        let result = this.currentPlayList[this.currentPlayIndex];
        if(result) {
            this.validateNewTrack(result);
        } else {
            this.currentPlayIndex = this.currentPlayIndex - 1;
        }
        //always paginate
        this.paginate();
        return false;

    }

    paginate() {
        let offset = this.currentPlayListOffset;
        this.currentPlayListOffset = this.currentPlayListLimit + this.currentPlayListOffset;
        Api.get("load/tracks", {
            userid : this.component.props.userid,
            key : this.component.props.apikey,
            type : this.type,
            type_id : this.typeId,
            offset : offset,
            limit : this.currentPlayListLimit
        }).then((result) => {
            let lists = [];
            lists.push(...this.currentPlayList);
            lists.push(...result);
            this.currentPlayList = lists;
            this.currentPlayListOffset = lists.length - 1;
            this.component.component.player = this;
            this.component.component.state.itemLists = lists;
            this.component.component.limit = this.currentPlayListLimit;
            this.component.component.offset = this.currentPlayListOffset;
        }).catch(() => {
        })
    }

    goPrevious() {
        console.log('prev event occurred')
        //console.log(this.currentPlayList);
        this.currentPlayIndex = this.currentPlayIndex - 1;
        let result = this.currentPlayList[this.currentPlayIndex];
         if (result) {
             this.validateNewTrack(result);
         } else {
             this.currentPlayIndex = this.currentPlayIndex + 1;
         }
        return false;
        /**Api.get('navigate/player', {
            userid : this.component.props.userid,
            key : this.component.props.apikey,
            id : this.track.id,
            type : this.type,
            type_id : this.typeId,
            nav_type : 'previous'
        }).then((result) => {
            if (result.id === 0) return this.stopPlaying();
            this.validateNewTrack(result);
        }).catch((e) => {
            this.stopPlaying();
        })**/
    }

    validateNewTrack(result) {
        this.track = result;
        this.trackId = result.id;
        //this.component.player = this;
        let takeCareOf = false;
        try{
            //this.stopPlaying();
            this.component.reload(result, this.type,this.typeId,this.currentPlayIndex, this.component.component);
            takeCareOf = true;
        } catch (e) {

        }

        if (!takeCareOf) {
            this.stopPlaying();
            this.prepare();
            this.startPlaying();
        }

    }
}