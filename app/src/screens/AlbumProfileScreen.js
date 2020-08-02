import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Share} from 'react-native';
import {Icon, Button, Card, CardItem, Text, Input, Container, Item, Header, Toast} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import FastImage from 'react-native-fast-image'
import DisplayComponent from '../components/DisplayComponent';
import {BASE_CURRENCY, TRACK_PLAY_ACCESS} from "../config";
import TrackPlayer from "react-native-track-player/index";
import update from "immutability-helper/index";

class AlbumProfileScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.item = this.props.navigation.getParam('item');
        this.component = this.props.navigation.getParam('component');

        this.state = {
            ...this.state,
            item : this.item
        }
        //this.player.updateComponent(this);
        this.player.setTrack(this.item.track,'playlist',this.item.id);
        this.player.prepare();
    }


    componentDidMount() {
        if (this.item.price > 0) {
            if (this.item.track.canPlay === 1 || TRACK_PLAY_ACCESS  === 1) {
                this.player.updateComponent(this);
                this.player.stopPlaying();
                this.player.startPlaying();
            } else {
                this.showBuyNow('playlist', this.item.id)
            }
        } else {
            this.player.updateComponent(this);
            this.player.stopPlaying();
            this.player.startPlaying();
        }
    }

    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.headerBg, padding:10, flexDirection:'row'}}>
                <View style={{flexDirection:'row', flex:1}}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Icon name="arrow-round-back" style={{color:this.theme.blackColor, fontSize: 30}}/>
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={{color:this.theme.blackColor, fontSize: 20, marginLeft:10}}>{this.item.name}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => {this.like()}} style={{marginLeft:5}}>
                        <Icon name="heart" type="SimpleLineIcons" style={{fontSize:20,color:this.state.item.hasLiked === 1 ? this.theme.brandPrimary : this.theme.blackColor}}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        let message = lang.getString('share-playlist');
                        if (Platform.OS !== 'ios') message += ' ' + this.item.link;
                        Share.share({
                            message: message,
                            url: this.item.link,
                            title: lang.getString('share-playlist')
                        }, {
                            // Android only:
                            dialogTitle: lang.getString('share-playlist'),
                        })
                    }} style={{marginLeft:10}}>
                        <Icon name="share" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.blackColor}}/>
                    </TouchableOpacity>

                    {this.item.price > 0 ? (
                        <TouchableOpacity onPress={() => {
                            this.showPaymentModal('album', this.item.id, this.item.price);
                        }} style={{marginLeft:10}}>
                            <View style={{padding:4, borderRadius: 10, backgroundColor: this.theme.brandPrimary}}>
                                <Text style={{color: '#fff'}}>{BASE_CURRENCY}{this.item.price}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
            <DisplayComponent player={this.player} navigation={this.props.navigation} limit={20} type="playlist" typeId={this.item.id} displayType="lists"/>


        </Container>)
    }

    like() {
        if (!this.isLoggedIn()) return this.showLoginAlert();
        let item = this.item;
        item.hasLiked = (item.hasLiked === 1) ? 0 : 1;
        this.item = item;
        if (item.hasLiked === 1) {
            Toast.show({
                text: lang.getString('you-love-this'),
                textStyle: { color: this.theme.brandPrimary,textAlign:'center' }
            });
        }
        this.updateState(update(this.state, {
            item : {$set : item}
        }));

        Api.get("like/item", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : 'playlist',
            type_id : this.item.id
        });
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
})(AlbumProfileScreen)