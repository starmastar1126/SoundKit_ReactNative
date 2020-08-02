import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {
    Platform, View, Image, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Share,
    StyleSheet
} from 'react-native';
import {
    Icon, Button, Card, CardItem, Text, Input, Container, Item, Header, Tabs, TabHeading, Tab, ScrollableTab,
    Toast
} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import FastImage from 'react-native-fast-image'
import DisplayComponent from '../components/DisplayComponent';
import PeopleComponent from '../components/PeopleComponent';
import AlbumComponent from '../components/AlbumComponent'
import {BASE_CURRENCY} from "../config";
import TrackPlayer from "react-native-track-player/index";
import light from "../themes/light";
import update from "immutability-helper/index";

class UserProfileScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.item = this.props.navigation.getParam('item');
        this.component = this.props.navigation.getParam('component');

        this.state = {
            ...this.state,
            item : this.item,
            hasSpotlightLoaded : false,
            hasSpotlight : false
        }

        this.confirmSpotlight()
    }

    confirmSpotlight() {
        Api.get('has/spotlight', {
            userid : this.props.userid,
            key : this.props.apikey,
            theuserid : this.item.id
        }).then((r) => {
            this.updateState({
                hasSpotlightLoaded: true,
                hasSpotlight: (r.status === 1) ? true : false
            })
        })
    }
    render() {
        //console.log('profile - id' + this.item.id);
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
                    <FastImage
                        style={{width:30,height:30,marginTop:1,borderRadius:100, marginLeft: 5}}
                        source={{
                            uri: this.item.avatar
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text numberOfLines={1} style={{color:this.theme.blackColor, fontSize: 20, marginLeft:10}}>{this.item.full_name}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    {this.props.userid !== this.item.id ? (<TouchableOpacity onPress={() => {
                        this.follow();
                    }} style={{marginLeft:5}}>
                        <Icon name="user-follow" type="SimpleLineIcons" style={{fontSize:20,color:this.state.item.is_following === 1 ? this.theme.brandPrimary : this.theme.blackColor}}/>
                    </TouchableOpacity>) : null}
                    {this.props.userid !== null && this.props.userid !== this.item.id ? (<TouchableOpacity onPress={() => {
                        this.props.navigation.navigate("chat", {
                            user : this.item,
                            cid : null,
                            component: this,
                            player : this.player
                        })
                    }} style={{marginLeft:15}}>
                        <Icon name="envelope" type="SimpleLineIcons" style={{fontSize:20,color:this.state.item === 1 ? this.theme.brandPrimary : this.theme.blackColor}}/>
                    </TouchableOpacity>) : null}
                    <TouchableOpacity onPress={() => {
                        let message = lang.getString('share-profile');
                        if (Platform.OS !== 'ios') message += ' ' + this.item.link;
                        Share.share({
                            message: message,
                            url: this.item.link,
                            title: lang.getString('share-profile')
                        }, {
                            // Android only:
                            dialogTitle: lang.getString('share-profile'),
                        })
                    }} style={{marginLeft:15}}>
                        <Icon name="share" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.blackColor}}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {

                    }} style={{marginLeft:15}}>
                        <Icon name="info" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.blackColor}}/>
                    </TouchableOpacity>

                </View>
            </View>

            <Tabs renderTabBar={()=> <ScrollableTab style={{borderBottomWidth:0,borderTopWidth:0,borderColor:light.headerBorderTopColor}} />}  style={{
                paddingTop: 0,
                backgroundColor:this.theme.contentVariationBg,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:0,top:-1}}>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('all').toUpperCase()}>
                    {this.state.hasSpotlightLoaded ? (
                        <DisplayComponent headerComponent={(this.state.hasSpotlight) ? (<View style={{backgroundColor:this.theme.contentVariationBg}}>
                            <View style={{borderBottomWidth:10,borderBottomColor:'#F8F8F8'}}>
                                <Text style={{fontSize:17,fontWeight:'500',margin:10,color:this.theme.brandPrimary}}>{lang.getString("spotlight")}</Text>
                                <DisplayComponent player={this.player} navigation={this.props.navigation} limit={5} type="my-spotlight" typeId={this.item.id} displayType="horizontal-grid"/>
                            </View>
                        </View>) : null} key={this.item.id} player={this.player} navigation={this.props.navigation} limit={10} type="my-stream" typeId={this.item.id} displayType="feed-list"/>
                    ) : (<View style={{
                        ...StyleSheet.absoluteFillObject, // your color
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <ActivityIndicator />
                    </View>)}
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('tracks').toUpperCase()}>
                    <DisplayComponent key={this.item.id} player={this.player} navigation={this.props.navigation} limit={10} type="my-tracks" typeId={this.item.id + '-0'} displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('playlists').toUpperCase()}>
                    <AlbumComponent  player={this.player} navigation={this.props.navigation}  type="playlist" typeId={'profile-' + this.item.id}/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('albums').toUpperCase()}>
                    <AlbumComponent player={this.player} navigation={this.props.navigation}  type="album" typeId={'profile-' + this.item.id}/>
                </Tab>
            </Tabs>

        </Container>)
    }

    follow() {
        if (!this.isLoggedIn()) return this.showLoginAlert();
        let item = this.item;
        item.is_following = (item.is_following === 1) ? 0 : 1;
        this.item = item;
        if (item.is_following === 1) {
            Toast.show({
                text: lang.getString('you-follow-this'),
                textStyle: { color: this.theme.brandPrimary,textAlign:'center' }
            });
        }
        this.updateState(update(this.state, {
            item : {$set : item}
        }));

        Api.get("user/follow", {
            userid : this.props.userid,
            key : this.props.apikey,
            id : this.item.id
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
})(UserProfileScreen)