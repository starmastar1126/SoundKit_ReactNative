import React, {Component} from 'react';
import {Platform,View,Text,Image,TouchableOpacity,ScrollView,ProgressBarAndroid,ProgressViewIOS,Dimensions} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import light from "../themes/light";
import dark from "../themes/dark";
import {DEFAULT_THEME} from "../config";

class TrackProgressComponent extends TrackPlayer.ProgressComponent {

    lyrics = null;
    prevText = '';
    theme = dark;
    constructor(props) {
        super(props);

        this.player = this.props.player;
        this.track = this.props.track;
        if (this.track.lyrics !== undefined && this.track.lyrics) {
            let lines = this.track.lyrics.split('\n');
            let result = {};
            lines.forEach((line) => {
                let timeAnchors = line.match(/\d+:\d+\.\d+/g)
                if (!timeAnchors) {
                    return
                }

                let _t = line.split("]");
                let text = _t[_t.length - 1];

                timeAnchors.forEach( (anchor) => {
                    var _r = anchor.split(":").map(parseFloat)
                    var time = 0;
                    if (_r[0] > 0) time = _r[0] * 60;
                    time += _r[1]
                    //var time = (_r[0] * 60 + (Math.round(_r[1] * 10)) / 10) * 1000;
                    //var p = this._rn((time * 100) / this.track.track_duration, 1);
                    result[this._rn(time, 0)] = {
                        text
                    }
                })

            });
            //console.log(result);
            this.lyrics = result;
        }
        this.defaultTheme = (this.props.setup !== undefined) ? this.props.setup.default_mode : DEFAULT_THEME;
        if (this.props.theme !== undefined && this.props.theme !== null) {
            this.defaultTheme = this.props.theme;
        }

        switch(this.defaultTheme) {
            case 'light':
                this.theme = light;
                break;
            case 'dark':
                this.theme = dark;
                break
        }

        if (this.props.setup !== undefined ) {
            //set values from server
            this.theme.brandPrimary = this.props.setup.primary_color;
            this.theme.primaryTransparent = this.props.setup.transparent_primary;
            this.theme.accentColor = this.theme.headerBg = this.theme.tabDefaultBg = this.props.setup.accent_color;
        }

    }

    async seekTo(e) {
        let viewWidth = Dimensions.get('window').width - 40;
        let cX  = e.nativeEvent.locationX;
        let percent = (cX/viewWidth) * 100;
        let  duration = await TrackPlayer.getDuration();
        let newPosition = (percent * duration) / 100;
        TrackPlayer.seekTo(newPosition);
    }

    _rn(num, scale) {
        if(!("" + num).includes("e")) {
            return +(Math.round(num + "e+" + scale)  + "e-" + scale);
        } else {
            var arr = ("" + num).split("e");
            var sig = ""
            if(+arr[1] + scale > 0) {
                sig = "+";
            }
            return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
        }
    }
    formatTime = timeInSec => {
        let mins = parseInt(timeInSec / 60);
        let secs = parseInt(Math.round((timeInSec % 60) * 100) / 100);
        if (mins < 10) {
            mins = '0' + mins;
        }
        if (secs < 10) {
            secs = '0' + secs;
        }
        return mins + ':' + secs;
    };
    renderLyrics() {
        if (this.lyrics && this.state.position > 0) {
            let percent = this.state.position * 100 / this.track.track_duration;
            //percent = this._rn(percent, 1);
            percent = this._rn(this.state.position, 0);
            if (this.lyrics[percent]) {
                this.prevText = this.lyrics[percent].text;
                return this.lyrics[percent].text;
            } else {
                return this.prevText;
            }
        } else {
            return '';
        }
    }

    getPercent() {
        return this.state.position * 100 / this.track.track_duration;
    }

    render() {
        let color = Platform.OS === 'ios' ? '#F8F8F8' : null;
        const screenWidth = Math.round(Dimensions.get('window').width);
        const waveWidth = screenWidth - 50;
        return (
            <View style={{flexDirection: 'column'}}>
                <View style={{height:25,margin:5,}}>
                    <Text style={{color:'#fff', textAlign:'center', fontStyle:'italic'}}>{this.renderLyrics()}</Text>
                </View>
                {this.props.setup.progress === 'bar' ? (<View onTouchStart={(e) => {
                    this.seekTo(e);
                }} style={{width:'100%', height:3, backgroundColor: {color},borderRadius: 5}}>

                    {Platform.OS === 'android' ? (
                        <ProgressBarAndroid
                            styleAttr="Horizontal"
                            color={this.theme.brandPrimary}
                            indeterminate={false}
                            style={{transform: [{ scaleX: 1.0 }, { scaleY: 1 }],backgroundColor:'#FBEBEE'}}
                            progress={this.getProgress()}
                        />
                    ) : (
                        <ProgressViewIOS
                            style={{transform: [{ scaleX: 1.0 }, { scaleY: 3 }]}}
                            styleAttr="Horizontal"
                            indeterminate={false}
                            trackTintColor="#FBEBEE"
                            progressTintColor={this.theme.brandPrimary}
                            progress={this.getProgress()}/>
                    ) }
                </View>) : (<View onTouchStart={(e) => {
                    this.seekTo(e);
                }} style={{width:waveWidth, height:50,background:'red',position:'relative'}}>

                    <FastImage resizeMode={FastImage.resizeMode.contain} source={{uri: this.track.wave}} style={{flex:1,width:waveWidth,height:50}}/>
                    <View style={{position:'absolute', top:0, width:this.getPercent() + '%', height:50,overflow:'hidden'}}>
                        <FastImage resizeMode={FastImage.resizeMode.contain} source={{uri: this.track.wave_colored}} style={{flex:1,width:waveWidth,height:50}}/>
                    </View>
                </View>)}


                <View style={{flexDirection:'row',marginTop:5}}>
                    <Text style={{color:'#fff',flex:1,textAlign:'left'}}>{this.formatTime(this.state.position)}</Text>
                    <Text style={{color:'#fff',flex:1,textAlign:'right'}}>{this.formatTime(this.state.duration)}</Text>
                </View>
            </View>
        );
    }
}
export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        apikey : state.auth.apikey,
        language : state.auth.language,
        cover : state.auth.cover,
        theme : state.auth.theme,
        setup: state.auth.setup
    }
})(TrackProgressComponent)
