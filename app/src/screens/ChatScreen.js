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


class ChatScreen extends BaseScreen {
    offset = 0;
    limit = 10;
    constructor(props) {
        super(props);
        this.activeMenu = "menu";


        this.user = this.props.navigation.getParam("user");
        this.cid  = this.props.navigation.getParam("cid", null);
        this.state = {
            ...this.state,
            text : ''
        }
        this.loadLists(false);
    }

    loadLists(paginate) {
        this.updateState({fetchFinished: false});
        let offset = this.offset;
        this.offset = this.limit + this.offset;
        Api.get("chats", {
            userid: this.props.userid,
            key: this.props.apikey,
            cid: this.cid,
            to: this.user.id,
            offset: offset,
            limit: this.limit
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {
                lists.push(...result);
            }
            this.updateState({
                itemLists: lists,
                fetchFinished: true,
                itemListNotEnd: (result.length < 1) ? true : false,
                refreshing: false
            })
        }).catch((e) => {
            this.updateState({fetchFinished: true, itemListNotEnd: true, refreshing: false});
        })

    }

    submitChat() {
        if (this.state.text === '') return;
        this.updateState({loading : true});
        Api.get('chat/send', {
            userid : this.props.userid,
            key : this.props.apikey,
            to : this.user.id,
            text : this.state.text
        }).then((result) => {
            let lists = [];
            lists.push(...this.state.itemLists);
            lists.push(result);
            this.updateState({itemLists: lists, text : '', loading : false});
            this.cid = result.cid

        }).catch((e) => {
           // console.log(e);
        })
    }

    render() {
        return this.showContent(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.headerBg, padding:10, flexDirection:'row'}}>
                <View style={{flexDirection:'row', flex:1}}>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.goBack();
                    }}>
                        <Icon name="arrow-round-back" style={{color:this.theme.whiteColor, fontSize: 30}}/>
                    </TouchableOpacity>
                    <FastImage
                        style={{width:30,height:30,marginTop:1,borderRadius:100, marginLeft: 5}}
                        source={{
                            uri: this.user.avatar
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />
                    <Text numberOfLines={1} style={{color:this.theme.whiteColor, fontSize: 20, marginLeft:10}}>{this.user.full_name}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => {
                        Share.share({
                            message: lang.getString('share-profile'),
                            url: this.user.link,
                            title: lang.getString('share-profile')
                        }, {
                            // Android only:
                            dialogTitle: lang.getString('share-profile'),
                        })
                    }} style={{marginLeft:15}}>
                        <Icon name="share" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.whiteColor}}/>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {
                        this.openProfile(this.user)
                    }} style={{marginLeft:15}}>
                        <Icon name="info" type="SimpleLineIcons" style={{fontSize:20,color:this.theme.whiteColor}}/>
                    </TouchableOpacity>

                </View>
            </View>
            <FlatList
                keyExtractor={(item, index) => item.id}
                data={this.state.itemLists}
                style={{flex:1}}
                ref='_flatList'
                onScroll={(event) => {
                    //console.log(event.nativeEvent.contentOffset.y);
                    let yOffset = event.nativeEvent.contentOffset.y;
                    if (yOffset < 5 && this.state.fetchFinished && !this.scrolling) {
                        //console.log('About fetch');
                        this.justPaginate = true;
                        this.loadLists(true);
                    }
                }}
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
                ) : (<EmptyComponent text={lang.getString('no_messages_found')}/>)}
                renderItem={({ item ,index}) => this.displayItem(item,index)}
            />

            <View style={{height: 60, borderTopColor: this.theme.greyHeaderBg, borderTopWidth:1, padding:10, flexDirection: 'row'}}>
                <View style={{flex:1,flexDirection: 'row'}}>
                    <FastImage source={{uri: this.props.avatar}} style={{width:40,height:40,borderRadius:100}}/>
                    <Item rounded style={{flex: 1,marginLeft: 5}}>
                        <Input style={{color:this.theme.blackColor}} value={this.state.text} placeholder={lang.getString('enter-message')} onChangeText={(t) => this.updateState({text : t})}/>
                    </Item>
                    <Button onPress={() => {this.submitChat()}} rounded success style={{backgroundColor:this.theme.brandPrimary,marginLeft: 5}}>
                        <Icon name="paper-plane" style={{fontSize: 18}} type="SimpleLineIcons"/>
                    </Button>
                </View>
            </View>
        </Container>)
    }

    displayItem(item,index) {
        return (<View style={{flex:1,flexDirection: 'row',padding:10}}>
            {this.props.userid === item.user.id ? (<View style={{alignContent:'flex-end',paddingLeft:40,marginTop:5,marginBottom:5,flex:1}}>
                <View style={{alignSelf:'flex-end',flexDirection:'row',}}>
                    <View style={{backgroundColor:this.theme.brandPrimary,borderRadius:15,padding:10}}>

                        {item.text !== '' ? (
                            <Text style={{color:'#fff'}}>{item.message}</Text>
                        ) : null}

                        {this.displayOthersContent(item,index)}
                    </View>
                    <FastImage source={{uri: this.props.avatar}} style={{width:30,height:30,borderRadius:20,margin:5}}/>
                </View>
                <Text style={{color:'grey',fontSize:10, alignSelf:'flex-end', right:50,marginTop:5}}>
                    {Time.ago(item.chattime)}
                </Text></View>) : (<View style={{alignContent:'flex-start',paddingRight:40,marginTop:5,marginBottom:5}}>
                <View style={{alignSelf:'flex-end',flexDirection:'row'}}>
                    <FastImage source={{uri: item.avatar}} style={{width:30,height:30,borderRadius:20,margin:5}}/>
                    <View style={{backgroundColor:this.theme.greyColor,borderRadius:15, padding: 10}}>
                        {item.text !== '' ? (
                            <Text style={{color:this.theme.blackColor}}>{item.message}</Text>
                        ) : null}
                        {this.displayOthersContent(item,index)}
                    </View>
                </View>
                <Text style={{color:'grey',fontSize:10, alignSelf:'flex-start', left:50,marginTop:5}}>
                    {Time.ago(item.chattime)}
                </Text>
            </View>)}
        </View>)
    }

    displayOthersContent(item,index) {
        let views = [];
        if (item.track !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.openProfile(item.playlist)
            }}>
                <View style={{width:200,flexDirection:'row', padding : 5}}>
                    <FastImage source={{uri: item.track.art}} style={{width:30,height:30,margin:5}}/>
                    <Text style={{margin:10, color:'#fff'}}>{item.track.title}</Text>
                </View>
            </TouchableOpacity>)
        }

        if (item.playlist !== undefined) {
            views.push(<TouchableOpacity onPress={() => {
                this.openPlaylist(item.playlist)
            }}>
                <View style={{width:200,flexDirection:'row', padding : 5}}>
                    <FastImage source={{uri: item.playlist.art}} style={{width:30,height:30,margin:5}}/>
                    <Text style={{margin:10, color:'#fff'}}>{item.playlist.name}</Text>
                </View>
            </TouchableOpacity>)
        }
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
})(ChatScreen)