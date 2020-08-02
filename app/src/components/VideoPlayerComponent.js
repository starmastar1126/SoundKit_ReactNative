import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {
    Platform, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, WebView,
    Share,StyleSheet
} from 'react-native';
import {Icon, Button, Card, CardItem, Text, Body, Left, Right, Container, Content, Header, Toast,Root} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import Api from "../api";
import storage from "../store/storage";
import FastImage from 'react-native-fast-image'
import BaseComponent from "../utils/BaseComponent";
import {API_KEY, BASE_URL, WEBSITE} from "../config";
import update from "immutability-helper/index";
import Modal from "react-native-modal";
import CommentComponent from './CommentComponent';


class VideoPlayerComponent extends BaseScreen {
    video = null;

    constructor(props) {
        super(props);
        this.video = this.props.navigation.getParam("video");
        this.activeMenu = "video";
        this.state = {
            ...this.state,
            loading : true,
            item: this.video,
            videos : [],
            commentModalVisible : false,
        }

        this.item = this.video;
        this.component = this.props.navigation.getParam('component');
        this.streamUrl = BASE_URL + "play/video?id=" + this.video.id
        //console.log(this.streamUrl)
        this.registerViewPlays()
    }

    registerViewPlays() {
        Api.get('add/video/play', {
            userid : this.props.userid,
            key : this.props.apikey,
            id : this.video.id
        })

        Api.get('add/video/view', {
            userid : this.props.userid,
            key : this.props.apikey,
            id : this.video.id
        })

        Api.get('suggest/videos', {
            userid : this.props.userid,
            key : this.props.apikey,
            id : this.video.id
        }).then((result) => {
            this.updateState({videos : result})
        });
    }

    render() {
        return this.show(<Container style={{backgroundColor: this.theme.contentVariationBg}}>
            <Modal
                isVisible={this.state.commentModalVisible}
                onSwipe={() => this.updateState({ commentModalVisible: false })}
                style={{margin:0}}
            >
                <View style={{ flex: 1,backgroundColor:this.theme.whiteColor }}>
                    <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
                    </Header>
                    <CommentComponent navigation={this.props.navigation} type="video" trackId={this.item.id} component={this} track={this.item}/>
                </View>
            </Modal>
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Icon name="arrow-round-back" style={{color:this.theme.blackColor, fontSize: 30}}/>
                </TouchableOpacity>
                <Text numberOfLines={1} style={{color:this.theme.blackColor, fontSize: 17, marginLeft:10,marginTop:5}}>{this.video.title}</Text>
            </View>
            <Content style={{backgroundColor: this.theme.contentVariationBg}}>
                <View style={{width:'100%',height:300,backgroundColor:'#000'}}>
                    <WebView onLoadEnd={() => {
                        this.updateState({loading: false});
                    }} source={{uri : this.streamUrl}} style={{width:'100%',height:300,backgroundColor:'#000'}}/>
                    {
                        this.state.loading && (
                            <View style={{
                                ...StyleSheet.absoluteFillObject,
                                backgroundColor: '#000000',  // your color
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ActivityIndicator />
                            </View>
                        )
                    }
                </View>

                <View style={{ flexDirection:'row', marginTop: 15}}>
                    <View style={{flexDirection:'row',flex: 1}}>
                        <TouchableOpacity onPress={() => {this.like()}} style={{padding:5,marginLeft:15}}>
                            <Icon name="heart" type="SimpleLineIcons" style={{fontSize:20,color:this.state.item.hasLiked === 1 ? this.theme.brandPrimary : this.theme.blackColor}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {this.updateState({commentModalVisible : true})}} style={{padding:5,marginLeft:15}}>
                            <Icon name="bubble" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.blackColor}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            let message = lang.getString('share-video-message');
                            if (Platform.OS !== 'ios') message += ' ' + this.item.link;
                            Share.share({
                                message: message,
                                url: this.item.link,
                                title: lang.getString('share-video')
                            }, {
                                // Android only:
                                dialogTitle: lang.getString('share-video'),
                            })
                        }} style={{padding:5,marginLeft:15}}>
                            <Icon name="share" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.blackColor}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        <Icon name="heart" type="SimpleLineIcons" style={{fontSize: 17,color: this.theme.blackColor}}/>
                        <Text style={{marginLeft:5,color: this.theme.blackColor}}>{this.state.item.likeCount}</Text>

                        <Icon name="eye" type="SimpleLineIcons" style={{fontSize: 17,color: this.theme.blackColor,marginLeft: 7}}/>
                        <Text style={{marginLeft:5,marginRight: 7,color: this.theme.blackColor}}>{this.state.item.views}</Text>

                        <Icon name="control-play" type="SimpleLineIcons" style={{fontSize: 17,color: this.theme.blackColor,marginLeft: 7}}/>
                        <Text style={{marginLeft:5,marginRight: 7,color: this.theme.blackColor}}>{this.state.item.plays}</Text>
                    </View>
                </View>


                <View style={{flexDirection: 'row',borderTopColor:this.theme.greyColor, borderTopWidth:0.5,marginTop:15,padding:10,backgroundColor: this.theme.lightGreyColor}}>
                    <TouchableOpacity style={{}} onPress={() => {

                    }}><FastImage
                        style={{width:40,height:40,borderRadius:100,borderColor:'#D1D1D1',borderWidth:1}}
                        source={{
                            uri: this.state.item.user.avatar
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    /></TouchableOpacity>

                    <Text style={{marginLeft: 10, marginTop:10,fontSize: 15, color: this.theme.blackColor}}>{this.state.item.user.full_name}</Text>
                </View>

                {this.state.videos.length > 0 ? (
                    <View style={{marginTop: 10, padding: 10}}>
                        <Text style={{fontSize:15, color: this.theme.blackColor,marginBottom: 10}}>{lang.getString('suggested-videos')}</Text>

                        {this.displayVideos()}
                    </View>
                ) : null}

            </Content>
        </Container>);
    }

    displayVideos() {
        let views = [];

        for(let i=0;i<this.state.videos.length;i++) {
            let video = this.state.videos[i];
            views.push(<TouchableOpacity onPress={() => {
                this.props.navigation.push("videoPlayer", {
                    video : video,
                    component : this,
                    player : this.player
                })
            }}>
                <View style={{flexDirection:'row',marginBottom:10}}>
                    <FastImage
                        style={{width:40,height:40,borderColor:'#D1D1D1',borderWidth:1}}
                        source={{
                            uri: video.art
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <View style={{flex:1}}>
                        <Text numberOfLines={1} style={{marginLeft: 10, marginTop:10,fontSize: 15, color: this.theme.blackColor}}>{video.title}</Text>
                    </View>
                    <View style={{flexDirection:'row', marginLeft: 10, marginTop: 7}}>
                        <Icon name="heart" type="SimpleLineIcons" style={{fontSize: 14,color: this.theme.blackColor}}/>
                        <Text style={{marginLeft:5,color: this.theme.blackColor}}>{video.likeCount}</Text>
                        <Icon name="control-play" type="SimpleLineIcons" style={{fontSize: 14,color: this.theme.blackColor,marginLeft: 7}}/>
                        <Text style={{marginLeft:5,marginRight: 7,color: this.theme.blackColor}}>{video.plays}</Text>
                    </View>
                </View>
            </TouchableOpacity>)
        }

        return (<View>{views}</View>)
    }
    like() {
        if (!this.component.isLoggedIn()) return this.component.showLoginAlert();
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
            type : 'video   ',
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
})(VideoPlayerComponent)
