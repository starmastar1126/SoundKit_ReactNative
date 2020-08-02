import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView,Share,ActivityIndicator,ImageBackground} from 'react-native';
import {Container,Icon,Header,Content,Toast,Root} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import Modal from "react-native-modal";
import CommentComponent from '../components/CommentComponent';
import Api from "../api";
import DisplayComponent from '../components/DisplayComponent';
import update from "immutability-helper";
import TrackProgressComponent from '../components/TrackProgressComponent'
import {BASE_CURRENCY, TRACK_PLAY_ACCESS} from "../config";

var RNFS = require('react-native-fs');
class PlayerScreen extends BaseScreen {
    item = null;
    type = '';
    typeId = '';
    needsPrapare = true;
    constructor(props) {
        super(props);
        this.item = this.props.navigation.getParam("item");
        this.type = this.props.navigation.getParam("type");
        this.typeId = this.props.navigation.getParam("typeId");
        this.component = this.props.navigation.getParam("component");
        this.player.currentPlayList = (this.props.navigation.getParam("playList") !== null) ? this.props.navigation.getParam("playList") : this.component.state.itemLists;
        this.player.currentPlayListLimit = (this.props.navigation.getParam("playLimit") !== null) ? this.props.navigation.getParam("playLimit") : this.component.limit;
        this.player.currentPlayListOffset = (this.props.navigation.getParam("playOffset") !== null) ? this.props.navigation.getParam("playOffset") : this.component.offset;
        this.player.currentPlayIndex = this.props.navigation.getParam("index")

        this.comp = this;

        if (this.player.track !== null && typeof  this.player.track === "object" && this.player.track.id === this.item.id) this.needsPrapare = false;
        if (this.props.navigation.getParam("canPrepare") === false) {
            this.needsPrapare = false;
            this.player = this.props.navigation.getParam("player");
        } else {
            this.player.setTrack(this.item,this.type,this.typeId);
        }

        setTimeout(() => {
            if (this.needsPrapare && (this.item.canPlay === 1 || TRACK_PLAY_ACCESS === 1 || this.type === 'radio')) {
                this.player.prepare();
            }
        }, 300);
        this.state = {
            ...this.state,
            infoModalVisible : false,
            commentModalVisible : false,
            item: this.item,
            nextupModalVisible : false
        }

        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.updateState({player : (this.player.track !== null) ? true : false})
            this.player.updateComponent(this.comp);
            this.updateState({
                playing : this.player.playing,
                isPaused: this.player.isPaused
            });

            if (this.type !== 'radio') this.loadTrackDetails()
        });
        if (this.type !== 'radio') this.loadTrackDetails();

    }

    reload(item, type,typeId, index, component) {
        this.item = item;
        this.needsPrapare = true;
        this.player.currentPlayIndex = index;
        this.component  = component;
        this.player.currentPlayList = component.state.itemLists;
        this.player.currentPlayListLimit = component.limit;
        this.player.currentPlayListOffset = component.offset;
        this.player.setTrack(this.item,this.type,this.typeId);
        this.player.stopPlaying();
        this.player.actualPlaying = false;
        //console.log(item);
        if (this.needsPrapare  && (this.item.canPlay === 1 || TRACK_PLAY_ACCESS === 1 || this.type === 'radio')) {
            this.player.prepare();
        } else {
            this.showBuyNow('track', this.item.id,this.item.price)
        }
        this.state = {
            ...this.state,
            infoModalVisible : false,
            commentModalVisible : false,
            item: this.item,
            nextupModalVisible : false
        }
        //this.player.startPlaying();

        if (this.type !== 'radio') this.loadTrackDetails()
    }

    loadTrackDetails() {
        Api.get("track/details", {
            userid : this.props.userid,
            key : this.props.apikey,
            id : this.item.id
        }).then((result) => {
            this.item = result;
            this.updateState(update(this.state, {
                item : {$set : result}
            }));
        })
    }

    componentDidMount() {
        //console.log(this.player);
        if ( this.needsPrapare) {
            if (this.item.canPlay === 1 || TRACK_PLAY_ACCESS === 1 || this.type === 'radio') {
                this.player.updateComponent(this);
                this.player.stopPlaying();
                this.player.startPlaying();
            } else {
                this.showBuyNow('track', this.item.id,this.item.price)
            }
        }
    }

    render() {
        this.player.updateComponent(this);
        return this.showContent(<Container style={{flex: 1}}>
            {this.type !== 'radio' ? (<Modal
                isVisible={this.state.infoModalVisible}
                onSwipe={() => this.updateState({ infoModalVisible: false })}
                swipeDirection="down"
                style={{margin:0}}
            >
                <View style={{ flex: 1,backgroundColor:this.theme.contentVariationBg }}>
                    <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
                    </Header>


                    <Content style={{flex : 1, flexDirection: 'column', alignContent: 'center'}}>
                        <FastImage source={{uri: this.item.art_lg}} style={{flex:1,width:220,height:220, marginTop:40,alignSelf:'center'}}/>
                        <Text style={{color:this.theme.blackColor,alignSelf:'center', fontSize:20,fontWeight:'bold',textAlign:'center'}}>{this.item.title}</Text>
                        <Text style={{color:this.theme.blackColor,alignSelf:'center', fontSize:15,marginTop:5, textAlign:'center'}}>{lang.getString("by")} {this.item.reposter.full_name}</Text>

                        <View style={{alignContent:'center', flexDirection:'row',alignSelf: 'center', marginTop: 15}}>
                            <View style={{alignSelf:'center',padding:5,marginLeft:15, flexDirection:'row'}}>
                                <Icon name="heart" type="SimpleLineIcons" style={{fontSize:23,color:this.theme.brandPrimary}}/>
                                <Text style={{color: this.theme.blackColor, marginLeft:5, marginTop:5,fontWeight:'bold'}}>{this.item.likeCount}</Text>
                            </View>

                            <View style={{alignSelf:'center',padding:5,marginLeft:15, flexDirection:'row'}}>
                                <Icon name="bubble" type="SimpleLineIcons" style={{fontSize:23,color:this.theme.brandPrimary}}/>
                                <Text style={{color: this.theme.blackColor, marginLeft:5, marginTop:5,fontWeight:'bold'}}>{this.item.commentsCount}</Text>
                            </View>

                            <View style={{alignSelf:'center',padding:5,marginLeft:15, flexDirection:'row'}}>
                                <Icon name="loop" type="SimpleLineIcons" style={{fontSize:23,color:this.theme.brandPrimary}}/>
                                <Text style={{color: this.theme.blackColor, marginLeft:5, marginTop:5,fontWeight:'bold'}}>{this.item.repostCount}</Text>
                            </View>

                            <View style={{alignSelf:'center',padding:5,marginLeft:15, flexDirection:'row'}}>
                                <Icon name="earphones" type="SimpleLineIcons" style={{fontSize:23,color:this.theme.brandPrimary}}/>
                                <Text style={{color: this.theme.blackColor, marginLeft:5, marginTop:5,fontWeight:'bold'}}>{this.item.viewCount}</Text>
                            </View>

                            <View style={{alignSelf:'center',padding:5,marginLeft:15, flexDirection:'row'}}>
                                <Icon name="download" style={{fontSize:25,color:this.theme.brandPrimary}}/>
                                <Text style={{color: this.theme.blackColor, marginLeft:5, marginTop:5,fontWeight:'bold'}}>{this.item.downloadsCount}</Text>
                            </View>
                        </View>

                        <View style={{flexDirection: 'column', marginTop:20, padding:10,alignContent: 'flex-start'}}>
                            {this.item.description !== '' ? (<View style={{flexDirection: 'column'}}>
                                <Text style={{color:this.theme.blackColor, fontWeight:'bold',fontSize:17}}>{lang.getString("description")} :</Text>
                                <Text style={{color:this.theme.blackColor,fontSize:14,marginTop:7}}>{this.item.description}</Text>
                            </View>) : null}

                            {this.item.record !== '' ? (<View style={{flexDirection: 'column'}}>
                                <Text style={{color:this.theme.blackColor, fontWeight:'bold',fontSize:17}}>{lang.getString("record-label")} :</Text>
                                <Text style={{color:this.theme.blackColor,fontSize:14,marginTop:7}}>{this.item.record}</Text>
                            </View>) : null}

                            {this.item.buy !== '' ? (<View style={{flexDirection: 'column'}}>
                                <Text style={{color:this.theme.blackColor, fontWeight:'bold',fontSize:17}}>{lang.getString("buy-link")} :</Text>
                                <Text style={{color:this.theme.blackColor,fontSize:14,marginTop:7}}>{this.item.buy}</Text>
                            </View>) : null}

                            {this.item.track_release !== '' ? (<View style={{flexDirection: 'column'}}>
                                <Text style={{color:this.theme.blackColor, fontWeight:'bold',fontSize:17}}>{lang.getString("release-date")} :</Text>
                                <Text style={{color:this.theme.blackColor,fontSize:14,marginTop:7}}>{this.item.track_release}</Text>
                            </View>) : null}
                        </View>
                    </Content>
                    <TouchableOpacity onPress={() => {this.updateState({infoModalVisible : false})}} style={{position:'absolute', right: 10, top : 20}}>
                        <Icon name="close"  style={{color:this.theme.blackColor, fontSize: 45}}/>
                    </TouchableOpacity>

                </View>
            </Modal>) : null}

            {this.type !== 'radio' ? <Modal
                    isVisible={this.state.nextupModalVisible}
                    onSwipe={() => this.updateState({ nextupModalVisible: false })}
                    style={{margin:0}}
                >
                    <View style={{ flex: 1,backgroundColor:this.theme.contentVariationBg }}>
                        <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
                        </Header>
                        <View style={{flexDirection: 'column',flex:1}}>
                            <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                                <TouchableOpacity onPress={() => {
                                    this.updateState({nextupModalVisible : false})
                                }}>
                                    <Icon name="arrow-left" type="SimpleLineIcons" style={{color:this.theme.blackColor, fontSize: 30}}/>
                                </TouchableOpacity>
                                <Text style={{color:this.theme.blackColor, fontSize: 20, marginLeft:10}}>{lang.getString('next-up')}</Text>
                            </View>

                            <View style={{flex: 1}}>
                                <DisplayComponent cacheFilter="nextup" component={this} player={this.player} navigation={this.props.navigation} limit={20} type={this.type} typeId={this.typeId} displayType="small-list"/>
                            </View>
                        </View>
                    </View>
                </Modal> : null}
            <Modal
                isVisible={this.state.commentModalVisible}
                onSwipe={() => this.updateState({ commentModalVisible: false })}
                style={{margin:0}}
            >
                <View style={{ flex: 1,backgroundColor:this.theme.contentVariationBg }}>
                    <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
                    </Header>
                    <CommentComponent navigation={this.props.navigation} type="track" trackId={this.item.id} component={this} track={this.item}/>
                </View>
            </Modal>

            <ImageBackground blurRadius={2} source={{uri: this.item.art_lg}} style={{flex:1,width:'100%',height:'100%'}}>
                <View style={{backgroundColor: 'rgba(0,0,0,0.8)', flex : 1, paddingTop:15,flexDirection:'row',alignContent:'center'}}>

                    {this.type !== 'radio' ? (<TouchableOpacity onPress={() => {this.updateState({infoModalVisible : true})}} style={{position:'absolute', left: 10, top : 35}}>
                            <Icon name="info" type="SimpleLineIcons" style={{color:'#fff', fontSize: 25}}/>
                        </TouchableOpacity>) : null}

                    {this.type !== 'radio' ? (<TouchableOpacity onPress={() => {this.updateState({nextupModalVisible: true})}} style={{position:'absolute', right: 10, top : 35}}>
                        <Icon name="playlist" type="SimpleLineIcons" style={{color:'#fff', fontSize: 25}}/>
                    </TouchableOpacity>) : null}

                    {this.type !== 'radio' && this.item.price > 0 ? (
                        <TouchableOpacity onPress={() => {
                            this.showPaymentModal('track', this.item.id, this.item.price);
                        }} style={{position:'absolute', left: 50, top : 35}}>
                            <View style={{padding:4, borderRadius: 10, backgroundColor: this.theme.brandPrimary}}>
                                <Text style={{color: '#fff'}}>{BASE_CURRENCY}{this.item.price}</Text>
                            </View>
                        </TouchableOpacity>
                    ) : null}

                    <View style={{alignSelf:'center', alignContent: 'center', padding:20,flexDirection:'column',flex:1}}>
                        <FastImage blurRadius={2} source={{uri: this.item.art_lg}} style={{width:150,height:150,alignSelf:'center',borderRadius:10,marginBottom:10,marginTop:20}}/>
                        <Text numberOfLines={1} style={{color:'#fff',alignSelf:'center', fontSize:20,fontWeight:'bold',textAlign:'center'}}>{this.item.title}</Text>
                        <Text style={{color:'#fff',alignSelf:'center', fontSize:15,marginTop:5, textAlign:'center'}}>{lang.getString("by")} {this.item.reposter.full_name}</Text>

                        <View style={{alignContent:'center', flexDirection:'row',alignSelf: 'center', marginTop: 15}}>
                            {this.type !== 'radio' ? (<TouchableOpacity onPress={() => {
                                this.addToPlaylist(this.item.id);
                            }} style={{alignSelf:'center',padding:5}}>
                                <Icon name="plus" type="SimpleLineIcons" style={{fontSize:30,color:'#fff'}}/>
                            </TouchableOpacity>) : null}
                            <TouchableOpacity onPress={() => {this.like()}} style={{alignSelf:'center',padding:5,marginLeft:15}}>
                                <Icon name="heart" type="SimpleLineIcons" style={{fontSize:30,color:this.state.item.hasLiked === 1 ? this.theme.brandPrimary : '#fff'}}/>
                            </TouchableOpacity>
                            {this.type !== 'radio' && this.state.item.isOwner !== 1 ? (<TouchableOpacity onPress={() => {this.repost()}} style={{alignSelf:'center',padding:5,marginLeft:15}}>
                                <Icon name="retweet" type="FontAwesome" style={{fontSize:30,color:this.state.item.hasReposted === 1 ? this.theme.brandPrimary : '#fff'}}/>
                            </TouchableOpacity>) : null}
                            <TouchableOpacity onPress={() => {this.updateState({commentModalVisible : true})}} style={{alignSelf:'center',padding:5,marginLeft:15}}>
                                <Icon name="bubble" type="SimpleLineIcons" style={{fontSize:30,color:'#fff'}}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                let message = lang.getString('share-track-message');
                                if (Platform.OS !== 'ios') message += ' ' + this.item.link;
                                Share.share({
                                    message: message,
                                    url: this.item.link,
                                    title: lang.getString('share-track')
                                }, {
                                    // Android only:
                                    dialogTitle: lang.getString('share-track'),
                                })
                            }} style={{alignSelf:'center',padding:5,marginLeft:15}}>
                                <Icon name="share" type="SimpleLineIcons" style={{fontSize:30,color:'#fff'}}/>
                            </TouchableOpacity>

                            {this.type !== 'radio' ? (<TouchableOpacity onPress={() => {
                                if (!this.isDownloading(this.item.id)) {
                                    if (this.isDownloaded(this.item.id)) {
                                        this.deleteDownload(this.item)
                                    } else {
                                        this.download(this.item)
                                    }
                                } else {
                                    this.deleteDownload(this.item);
                                }
                            }} style={{alignSelf:'center',padding:5,marginLeft:15}}>
                                {this.isDownloading(this.item.id) ? (
                                    <ActivityIndicator style={{alignSelf:'center',color:this.theme.brandPrimary}} size='large' />
                                ) : (this.isDownloaded(this.item.id) ? (<Icon name="download"  style={{fontSize:35,color:this.theme.brandPrimary}}/>) : (<Icon name="download"  style={{fontSize:35,color:'#fff'}}/>))}

                            </TouchableOpacity>) : null}
                        </View>

                        {this.type !== 'radio' ? (<View style={{padding:10,marginTop:40,marginBottom: 0}}>
                            <TrackProgressComponent key={this.player.track.id} track={this.player.track} player={this.player}/>
                        </View>) : null}

                        <View style={{alignContent:'center', flexDirection:'row',alignSelf: 'center'}}>
                            <TouchableOpacity onPress={() => {
                                if (this.type === 'radio') return true;
                                this.player.goPrevious()
                            }} style={{alignSelf:'center',padding:5}}>
                                <Icon name="control-rewind" type="SimpleLineIcons" style={{fontSize:23,color:'#fff'}}/>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                this.validatePlayer();
                                this.player.togglePlay()
                            }} style={{alignSelf:'center',
                                backgroundColor: this.theme.brandPrimary,
                                padding:5,marginLeft:15,width:60,height:60,borderRadius:100}}>
                                {!this.state.isPaused ? (
                                    <Icon name="control-pause" type="SimpleLineIcons" style={{fontSize:20,color:'#fff',position:'absolute', top:18,left:20}}/>
                                ) : (
                                    <Icon name="control-play" type="SimpleLineIcons" style={{fontSize:20,color:'#fff',position:'absolute', top:18,left:20}}/>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                if (this.type === 'radio') return true;
                                this.player.goNext()
                            }} style={{alignSelf:'center',padding:5,marginLeft:20}}>
                                <Icon name="control-forward" type="SimpleLineIcons" style={{fontSize:23,color:'#fff'}}/>
                            </TouchableOpacity>

                        </View>
                    </View>

                    <TouchableOpacity onPress={() => {this.minimize()}} style={{position:'absolute', right: '47%', bottom : 10}}>
                        <Icon name="arrow-down" type="SimpleLineIcons" style={{color:'#fff', fontSize: 25}}/>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </Container>)
    }

    minimize() {
        this.component.minimizePlayer(this.player);
        this.props.navigation.goBack();

    }

    repost() {
        if (!this.isLoggedIn()) return this.showLoginAlert();
        let item = this.item;
        item.hasReposted = (item.hasReposted === 1) ? 0 : 1;
        this.item = item;
        this.updateState(update(this.state, {
            item : {$set : item}
        }));

        if (item.hasReposted === 1) {
            Toast.show({
                text: lang.getString('you-reposted-this'),
                textStyle: { color: this.theme.brandPrimary,textAlign:'center' }
            });
        }
        Api.get("like/item", {
            userid : this.props.userid,
            key : this.props.apikey,
            action : 'repost-track',
            track : this.item.id
        });
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
            type : 'track',
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
})(PlayerScreen)
