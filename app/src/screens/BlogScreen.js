import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share,Linking,ActivityIndicator,FlatList,Dimensions,WebView} from 'react-native';
import {Container,Icon,Button,Header,Content, Form,Input,Label,Item,Toast,Card,CardItem} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../api";
import EmptyComponent from '../utils/EmptyComponent'
import storage from "../store/storage";
import Time from "../utils/Time";
import Modal from "react-native-modal";
import {offlineSchema} from "../store/realmSchema";
class BlogScreen extends BaseScreen {

    type = "all";
    typeId = "";
    offset = 0;
    limit = 10;
    cacheFilter = "";
    viewBlog = null;

    constructor(props) {
        super(props);
        this.activeMenu = "menu";
        this.state = {
            ...this.state,
            typeId: '',
            viewModalVisible: false
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
                Realm.open({path: 'blogs.realm', schema: [offlineSchema]}).then(realm => {
                    let name = "blogs-" + this.props.userid;
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

        Api.get("blogs", {
            userid : this.props.userid,
            key : this.props.apikey,
            offset : offset,
            limit : this.limit,
            type: this.type,
            type_id: this.state.typeId,
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {


                lists.push(...result);
                Realm.open({path: 'blogs.realm',schema: [offlineSchema]}).then(realm => {
                    realm.write(() => {
                        let name = "blogs-"  + this.props.userid;
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
            {this.viewBlog ? (<Modal
                isVisible={this.state.viewModalVisible}
                onSwipe={() => this.updateState({ viewModalVisible: false })}
                style={{margin:0}}
            >
                <View style={{ flex: 1,backgroundColor:this.theme.whiteColor }}><View style={{flexDirection: 'column',flex:1}}>
                    <View style={{width:'100%',height:68, backgroundColor: this.theme.accentColor, padding:10, flexDirection:'row',paddingTop: (Platform.OS === 'ios') ? 35 : 0}}>
                        <TouchableOpacity onPress={() => {
                            this.updateState({viewModalVisible : false})
                        }}>
                            <Icon name="arrow-round-back"  style={{color:'#fff', fontSize: 25}}/>
                        </TouchableOpacity>
                        <Text numberOfLines={1} style={{color:'#fff', fontSize: 12, marginLeft:10,marginTop:5}}>{this.viewBlog.title}</Text>
                    </View>
                    <WebView style={{ flex: 1,fontSize:20,padding:10 }}
                        source={{html: this.viewBlog.content}}
                    />
                </View>
                </View>
            </Modal>) : null}
            <Header searchBar rounded noShadow style={{paddingBottom:20,backgroundColor: this.theme.headerBg,height:65}}>
                <Item style={{backgroundColor:'rgba(0,0,0,0.2)',top:10}}>
                    <Icon style={{color:'#E3E3E3'}} name="ios-search" />
                    <Input style={{color:'#E3E3E3'}} value={this.state.typeId} onChangeText={(t) => {
                        this.offset = 0;
                        this.updateState({typeId : t});
                        this.loadLists(false);
                    }} placeholder={lang.getString('search-blogs')} />
                    <Icon style={{color:'#303A4F'}} name="music-tone" type="SimpleLineIcons" />
                </Item>
            </Header>
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
                ) : (<EmptyComponent text={lang.getString('no_blogs_found')}/>)}
                renderItem={({ item ,index}) => this.displayItem(item,index)}
            />
        </Container>)
    }

    displayItem(item,index) {
        return (<Card transparent style={{borderTopColor:this.theme.borderLineColor,backgroundColor:this.theme.contentVariationBg,borderTopWidth:15}}>
            <CardItem cardBody style={{backgroundColor:this.theme.contentVariationBg}}>
                <FastImage source={{uri: item.art}} style={{borderRadius:5,height: 250, width:'95%',resizeMode:'cover',marginTop:5,marginLeft:10,marginRight:10}}>
                    <TouchableOpacity onPress={() => {
                        this.viewBlog = item;
                        this.updateState({viewModalVisible: true});
                    }}>
                        <View style={{alignSelf:'flex-start',flexDirection:'row',maxWidth:'70%',margin:10,marginTop:10}}>
                            <View style={{backgroundColor:this.theme.accentColor,padding:5}}>
                                <Text style={{color: '#fff',fontWeight:'bold'}}  numberOfLines={2}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <View style={{flexDirection:'row', bottom:10,marginTop:10,position:'absolute',margin:10}}>
                        <Icon type="SimpleLineIcons" name="heart" style={{color:'#fff',fontSize:20,
                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                        }}/>
                        <Text style={{textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                            color:'#fff',marginLeft:-10,fontSize:12,bottom:2,marginRight:7,fontWeight:'bold'}}>{item.likeCount}</Text>

                        <Icon type="SimpleLineIcons" name="eye" style={{color:'#fff',fontSize:20,
                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                            marginLeft:7}}/>
                        <Text style={{textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,color:'#fff',marginLeft:-10,fontSize:12,bottom:2,marginRight:7,fontWeight:'bold'}}>{item.views}</Text>
                        <Icon type="SimpleLineIcons" name="bubble" style={{color:'#fff',fontSize:20,textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                            marginLeft:7}}/>
                        <Text style={{textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,color:'#fff',marginLeft:-10,fontSize:12,bottom:2,marginRight:7,fontWeight:'bold'}}>{item.commentsCount}</Text>
                    </View>
                </FastImage>
            </CardItem>
        </Card>);
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
})(BlogScreen)