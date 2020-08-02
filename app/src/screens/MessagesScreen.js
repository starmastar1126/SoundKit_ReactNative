import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share,Linking,ActivityIndicator,FlatList} from 'react-native';
import {Container,Icon,Button,Header,Content, Form,Input,Label,Item,Toast,Badge} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../api";
import EmptyComponent from '../utils/EmptyComponent'
import storage from "../store/storage";
import Time from "../utils/Time";
import {offlineSchema} from "../store/realmSchema";


class MessagesScreen extends BaseScreen {

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
                Realm.open({path: 'messages.realm', schema: [offlineSchema]}).then(realm => {
                    let name = "messages-" + this.props.userid;
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

        Api.get("message/lists", {
            userid : this.props.userid,
            key : this.props.apikey,
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {


                lists.push(...result);
                if (!this.noCache){
                    Realm.open({path: 'messages.realm',schema: [offlineSchema]}).then(realm => {
                        realm.write(() => {
                            let name = "messages-" + this.props.userid;
                            realm.create('offline_schema', {id: name, value: JSON.stringify(lists)}, true);
                        });

                        //realm.close();
                    });
                }
            }
            this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length < 1) ? true : false,refreshing: false});
        }).catch((e) => {
           // console.log(e);
            this.updateState({fetchFinished: true,itemListNotEnd: true,refreshing: false});
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
                <Text style={{color:this.theme.whiteColor, fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('messages')}</Text>
            </View>
            <FlatList
                keyExtractor={(item, index) => item.id}
                data={this.state.itemLists}
                style={{flex:1}}
                ref='_flatList'
                onEndReachedThreshold={.5}
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
                ) : (<EmptyComponent text={lang.getString('no_conversations_found')}/>)}
                renderItem={({ item ,index}) => this.displayItem(item,index)}
            />
        </Container>)
    }

    displayItem(item,index) {
            return (<TouchableOpacity onPress={() => {
                this.props.navigation.navigate("chat", {
                    user : item.user,
                    cid : item.id,
                    component: this,
                    player : this.player
                })
            }}><View style={{flex:1,flexDirection: 'row',padding:10,borderBottomColor:this.theme.borderLineColor,borderBottomWidth:1}}>
                <FastImage
                    style={{width:50,height:50,marginTop:4,borderRadius: 100}}
                    source={{
                        uri: item.user.avatar
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                <View style={{flex:1,marginLeft: 10,flexDirection:'column'}}>
                    <Text style={{color: this.theme.blackColor, fontSize: 14, fontWeight:'500',marginTop:5}}>{item.user.full_name}</Text>
                    <Text note style={{color: this.theme.blackColor}}>{item.message.message}</Text>

                    <Text note style={{marginLeft: 5, position: 'absolute', right : 5, top: 10,color:this.theme.blackColor}}>{Time.ago(item.message.chattime)}</Text>
                    {item.unread > 0 ? (<View style={{position:'absolute', right: 30, top: 12,width:10,height:10,borderRadius:100,backgroundColor:this.theme.brandPrimary}}></View>) : null}
                </View>
            </View></TouchableOpacity>)
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
})(MessagesScreen)