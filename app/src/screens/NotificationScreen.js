import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share,Linking,ActivityIndicator,FlatList} from 'react-native';
import {Container,Icon,Button,Header,Content, Form,Input,Label,Item,Toast} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../api";
import EmptyComponent from '../utils/EmptyComponent'
import storage from "../store/storage";
import {offlineSchema} from "../store/realmSchema";


class NotificationScreen extends BaseScreen {

    type = "";
    typeId = "";
    offset = 0;
    limit = 10;
    cacheFilter = "";

    constructor(props) {
        super(props);
        this.activeMenu = "menu";
        this.state = {
            ...this.state,
        }
        this.cacheFilter = (this.props.cacheFilter !== undefined) ? this.props.cacheFilter : '';
        this.loadLists(false);
    }

    loadLists(paginate) {
        this.updateState({fetchFinished : false});
        let offset = this.offset;
        this.offset = this.limit + this.offset;
        if(!paginate && !this.cacheLoaded) {
            this.cacheLoaded = true;
            if (!this.noCache) {
                Realm.open({path: 'notifications.realm', schema: [offlineSchema]}).then(realm => {
                    let name = "notifications-" + this.props.userid;
                    let data = realm.objects("offline_schema").filtered("id='"+name+"'");
                    let value = null;
                    for (let p of data) {
                        value = p
                    }
                    if ( value !== null) {
                        let lists = [];
                        let data = JSON.parse(value.value);
                        lists.push(...data);
                        this.updateState({itemLists: lists,fetchFinished: true});
                    }
                    //realm.close();
                });
            }
        }

        Api.get("notifications", {
            userid : this.props.userid,
            key : this.props.apikey,
            offset : offset,
            limit : this.limit
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {


                lists.push(...result);
                Realm.open({path: 'notifications.realm',schema: [offlineSchema]}).then(realm => {
                    realm.write(() => {
                        let name = "notifications-"  + this.props.userid;
                        realm.create('offline_schema', {id: name, value: JSON.stringify(lists)}, true);
                    });

                    //realm.close();
                });
            }
            this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length < 1) ? true : false});
        }).catch((e) => {
            //console.log(e);
            this.updateState({fetchFinished: true,itemListNotEnd: true});
        })
    }

    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.headerBg, padding:10, flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Icon name="arrow-round-back"  style={{color:this.theme.whiteColor, fontSize: 30}}/>
                </TouchableOpacity>
                <Text style={{color:this.theme.whiteColor, fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('notifications')}</Text>
            </View>
            <FlatList
                keyExtractor={(item, index) => item.id}
                data={this.state.itemLists}
                style={{flex:1}}
                ref='_flatList'
                onEndReachedThreshold={.5}
                onEndReached={(d) => {
                    if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                        this.loadLists(true);
                    }
                    return true;
                }}
                extraData={this.state}
                refreshing={this.state.refreshing}
                onRefresh={() => {
                    this.offset = 0;
                    this.updateState({refreshing : true});
                    this.loadLists(false);
                }}
                ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                    {this.state.fetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                </View>}
                ListEmptyComponent={!this.state.fetchFinished ? (
                    <Text/>
                ) : (<EmptyComponent text={lang.getString('no_notifications_found')}/>)}
                renderItem={({ item ,index}) => this.displayItem(item,index)}
            />
        </Container>)
    }

    displayItem(item,index) {
        let title = item.title;
        if (title !== undefined) {
            title = title.replace('<strong>', '');
            title = title.replace('</strong>', '');
            return (<TouchableOpacity onPress={() => {
                switch(item.click) {
                    case 'user':
                        this.openProfile(item.user);
                        break;
                    case 'track':
                        this.play(item.track, 'feed', '');
                        break;
                    case 'playlist':
                        this.openPlaylist(item.track)
                        break;
                }
            }}><View style={{flex:1,flexDirection: 'row',padding:10,backgroundColor:this.theme.contentVariationBg}}>
                <FastImage
                    style={{width:40,height:40,marginTop:4}}
                    source={{
                        uri: item.avatar
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View style={{flex:1,marginLeft: 10,flexDirection:'column'}}>
                    <Text style={{color: this.theme.blackColor, fontSize: 14, fontWeight:'500',marginTop:5}}>{item.user.full_name} {title}</Text>

                </View>
            </View></TouchableOpacity>)
        }
        return null;
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
})(NotificationScreen)