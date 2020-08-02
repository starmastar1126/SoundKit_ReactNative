import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Image,TouchableOpacity,ScrollView,ActivityIndicator,FlatList} from 'react-native';
import {Icon,Button,Card, CardItem, Text, Body,Left,Right} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import { FlatGrid} from 'react-native-super-grid';
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import storage from "../store/storage";
import FastImage from 'react-native-fast-image'
import {offlineSchema, trackSchema} from "../store/realmSchema";
import {BASE_CURRENCY, ENABLE_PREMIUM, STORE_MODULE} from "../config";
import Time from "../utils/Time";
const Realm = require('realm');
class DisplayComponent extends BaseScreen {
    type = "";
    typeId = "";
    offset = 0;
    limit = 10;
    cacheFilter = "";

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            type : this.props.type,
            typeId : this.props.typeId,
            displayType : (this.props.displayType !== undefined) ? this.props.displayType : 'list',
         }
         this.limit = (this.props.limit !== undefined) ? this.props.limit : 10;
        this.cacheFilter = (this.props.cacheFilter !== undefined) ? this.props.cacheFilter : '';
        this.component = this.props.component;
        this.noCache = (this.props.noCache === undefined) ? false : true

       this.loadLists(false);
       //console.log('TypeId - ' + this.state.typeId)
    }

    loadLists(paginate) {
        this.updateState({fetchFinished : false});
        let offset = this.offset;
        this.offset = this.limit + this.offset;
        if (this.state.type === 'offline') {
            if (paginate) return;
            Realm.open({schema: [trackSchema]})
                .then(realm => {
                    let tracks = realm.objects('track_download');
                    let result  = [];
                    for(let i=0;i<tracks.length;i++) {
                        let d = tracks[i];
                        result.push(JSON.parse(d.details));
                    }

                    this.updateState({itemLists: result,fetchFinished: true, itemListNotEnd : true,refreshing: false});
                    //realm.close();
                });
        } else {
            if(!paginate && !this.cacheLoaded) {
                this.cacheLoaded = true;
                if (!this.noCache) {
                    Realm.open({path: 'tracklists.realm', schema: [offlineSchema]}).then(realm => {
                        let name = this.state.type  + this.state.typeId + this.cacheFilter;
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

            //console.log('userid- ' + this.props.userid);

            Api.get("load/tracks", {
                userid : this.props.userid,
                key : this.props.apikey,
                type : this.state.type,
                type_id : this.state.typeId,
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
                    if (!this.noCache) {
                        Realm.open({path: 'tracklists.realm',schema: [offlineSchema]}).then(realm => {
                            realm.write(() => {
                                let name = this.state.type  + this.state.typeId + this.cacheFilter;
                                realm.create('offline_schema', {id: name, value: JSON.stringify(lists)}, true);
                            });

                            //realm.close();
                        });
                    }
                }
                this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length < 1) ? true : false,refreshing: false});
            }).catch(() => {
                this.updateState({fetchFinished: true,itemListNotEnd: true,refreshing: false});
            })
        }
    }

    render() {
        switch(this.state.displayType) {
            case 'horizontal-grid':

                return this.minContent(<FlatGrid
                    keyExtractor={(item, index) => item.id}
                    items={this.state.itemLists}
                    extraData={this.state}
                    itemDimension={200}
                    spacing={15}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                            this.loadLists(true);
                        }
                        return true;
                    }}
                    fixed={true}
                    style={{height:200,marginBottom:10,marginLeft:-15}}
                    horizontal={true}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<View style={{justifyContent:"center",alignContent:'center',width:'100%',alignItems:'center',marginLeft:20}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>)}
                    </View>}
                    renderItem={({item ,index}) => this.displayGridItem(item,index,false)}/>)
                break;
            case 'vertical-grid':
                return this.minContent(<FlatGrid
                    keyExtractor={(item, index) => item.id}
                    items={this.state.itemLists}
                    extraData={this.state}
                    itemDimension={130}
                    spacing={15}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                            this.loadLists(true);
                        }
                        return true;
                    }}
                    fixed={false}
                    refreshing={this.state.refreshing}
                    onRefresh={() => {
                        this.offset = 0;
                        this.updateState({refreshing : true});
                        this.loadLists(false);
                    }}
                    ListHeaderComponent={(this.props.headerComponent !== undefined) ? this.props.headerComponent : null}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<View style={{justifyContent:"center",alignContent:'center',width:'100%',alignItems:'center'}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>)}
                    </View>}
                    ListEmptyComponent={!this.state.fetchFinished ? (
                        <Text/>
                    ) : (<EmptyComponent text={lang.getString('no_tracks_found')}/>)}
                    renderItem={({item ,index}) => this.displayGridItem(item,index, true)}/>);
                break;
            case 'vertical-album-grid':
                return this.minContent(<FlatGrid
                    keyExtractor={(item, index) => item.id}
                    items={this.state.itemLists}
                    extraData={this.state}
                    itemDimension={130}
                    spacing={15}
                    height={200}
                    onEndReachedThreshold={.5}
                    onEndReached={(d) => {
                        if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                            this.loadLists(true);
                        }
                        return true;
                    }}
                    fixed={false}
                    refreshing={this.state.refreshing}
                    onRefresh={() => {
                        this.offset = 0;
                        this.updateState({refreshing : true});
                        this.loadLists(false);
                    }}
                    ListHeaderComponent={(this.props.headerComponent !== undefined) ? this.props.headerComponent : null}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<View style={{justifyContent:"center",alignContent:'center',width:'100%',alignItems:'center'}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>)}
                    </View>}
                    ListEmptyComponent={!this.state.fetchFinished ? (
                        <Text/>
                    ) : (<EmptyComponent text={lang.getString('no_tracks_found')}/>)}
                    renderItem={({item ,index}) => this.displayGridAlbumItem(item,index, true)}/>);
                break;
            case 'small-list':
                return this.minContent(<FlatList
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
                    ListHeaderComponent={(this.props.headerComponent !== undefined) ? this.props.headerComponent : null}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                    </View>}
                    ListEmptyComponent={!this.state.fetchFinished ? (
                        <Text/>
                    ) : (<EmptyComponent text={lang.getString('no_tracks_found')}/>)}
                    renderItem={({ item ,index}) => this.displaySmallListItem(item,index)}
                />)
                break;
            case 'lists':
                return this.minContent(<FlatList
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
                    ListHeaderComponent={(this.props.headerComponent !== undefined) ? this.props.headerComponent : null}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                    </View>}
                    ListEmptyComponent={!this.state.fetchFinished ? (
                        <Text/>
                    ) : (<EmptyComponent text={lang.getString('no_tracks_found')}/>)}
                    renderItem={({ item ,index}) => this.displayListItem(item,index)}
                />)
                break;
            case 'feed-list':
                return this.minContent(<FlatList
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
                    ListHeaderComponent={(this.props.headerComponent !== undefined) ? this.props.headerComponent : null}
                    ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                        {this.state.fetchFinished ? (<Text/>) : (<ActivityIndicator size='large' />)}
                    </View>}
                    ListEmptyComponent={!this.state.fetchFinished ? (
                        <Text/>
                    ) : (<EmptyComponent text={lang.getString('no_tracks_found')}/>)}
                    renderItem={({ item ,index}) => this.displayFeedItem(item,index)}
                />)
                break;
        }
    }

    displaySmallListItem(item,index) {
        let component = this;
        return (<TouchableOpacity onPress={() => {

            if (this.component !== undefined) {
                this.component.updateState({nextupModalVisible : false});
                this.component.reload(item, this.type, this.typeId, index, component)
            } else {
                this.play(item, this.state.type, this.state.typeId, index)
            }
        }}><View style={{flex:1,flexDirection: 'row',padding:10}}>
            <FastImage
                style={{width:40,height:40,marginTop:4}}
                source={{
                    uri: item.art_md
                }}
                resizeMode={FastImage.resizeMode.cover}
            />
            <View style={{flex:1,marginLeft: 10,flexDirection:'column'}}>
                <Text style={{color: this.theme.blackColor, fontSize: 14, fontWeight:'500'}}>{item.title}</Text>
                <TouchableOpacity onPress={() => {
                    this.openProfile(item.reposter)
                }}>
                    <Text style={{color: this.theme.greyColor, fontSize: 13, marginTop:5}}>{item.reposter.full_name}</Text>
                </TouchableOpacity>
            </View>
        </View></TouchableOpacity>)
    }
    displayListItem(item,index) {
        let component = this;
        return (<TouchableOpacity onPress={() => {
            if (this.component !== undefined) {
                this.component.updateState({nextupModalVisible : false});
                this.component.reload(item, this.type, this.typeId, index, component)
            } else {
                this.play(item, this.state.type, this.state.typeId, index)
            }
        }}><View style={{flex:1,flexDirection: 'row',padding:10,borderBottomColor:this.theme.borderLineColor,borderBottomWidth:1}}>
            <FastImage
                style={{width:70,height:70,marginTop:4}}
                source={{
                    uri: item.art_md
                }}
                resizeMode={FastImage.resizeMode.cover}
            >
                <View style={{backgroundColor:'rgba(255,255,255,0.7)',width:40,height:40,borderRadius:100,alignContent:'center',alignSelf:'center',marginTop:10}}>
                    <Icon name='play' style={{color:this.theme.accentColor,alignSelf:'center',marginTop:5,marginLeft:2}} />
                </View>
            </FastImage>
            <View style={{flex:1,marginLeft: 10,flexDirection:'column',marginTop:10}}>
                <Text numberOfLines={1} style={{color: this.theme.blackColor, fontSize: 17, fontWeight:'bold'}}>{item.title}</Text>
                <TouchableOpacity onPress={() => {
                    this.openProfile(item.reposter)
                }}>
                    <Text style={{color: this.theme.greyColor, fontSize: 13, marginTop:5}}>{item.reposter.full_name}</Text>
                </TouchableOpacity>
            </View>
            <Text style={{marginTop:10,color:'#777777'}}>{item.duration}</Text>
        </View></TouchableOpacity>)
    }
    displayGridItem(item, index, vertical) {
        if (item === false) return null;

        return (<View style={{width: vertical ? null : 140,flex:1}}>
            <TouchableOpacity onPress={() => {
                this.play(item, this.state.type, this.state.typeId, index)
            }}><FastImage
                style={{borderRadius:5,width:'100%',height:130,marginBottom:10,borderColor:'#D1D1D1',borderWidth:1,boxShadow:'rgba(0, 0, 0, 0.05) 0px 1px 10px'}}
                source={{
                    uri: item.art_md
                }}
                resizeMode={FastImage.resizeMode.cover}
            >
                {this.props.setup.enable_store && item.price !== '0.00' && item.price > 0 ? (
                    <View style={{backgroundColor:this.theme.brandPrimary,padding:5,borderRadius:100,width:80, margin:7,alignContent: 'center'}}><Text numberOfLines={1} style={{color:'#fff',alignSelf:'center'}}>{BASE_CURRENCY}{item.price}</Text></View>
                ) : null}
                <View style={{backgroundColor:'rgba(255,255,255,0.7)',width:40,height:40,borderRadius:100,alignContent:'center',position:'absolute',left:50,top:50}}>
                    <Icon name='play' style={{color:this.theme.accentColor,alignSelf:'center',marginTop:5,marginLeft:2}} />
                </View>
            </FastImage></TouchableOpacity>
            <TouchableOpacity onPress={() => {
                this.play(item, this.state.type, this.state.typeId,index)
            }}><Text numberOfLines={1}  style={{fontSize:15,color:this.theme.blackColor,fontWeight:'bold'}}>{item.title}</Text></TouchableOpacity>
            {(item.user !== undefined) ? (
                <TouchableOpacity onPress={() => {
                    this.openProfile(item.user);
                }}>
                    <Text numberOfLines={1} note style={{marginTop:5,fontSize:15,fontWeight:'400'}}>{item.user.full_name}</Text>
                </TouchableOpacity>
            ) : null}
        </View>)
    }

    displayGridAlbumItem(item, index, vertical) {
        if (item === false) return null;
        return (<View style={{width: vertical ? null : 140,flex:1}}>
            <TouchableOpacity onPress={() => {
                this.openPlaylist(item.playlist)
            }}><FastImage
                style={{width:'100%',height:130,marginBottom:10,borderColor:'#D1D1D1',borderWidth:1}}
                source={{
                    uri: item.art_md
                }}
                resizeMode={FastImage.resizeMode.cover}
            >
                {this.props.setup.enable_store && item.playlist.price > 0  && item.playlist.price > 0 ? (
                    <View style={{backgroundColor:this.theme.brandPrimary,padding:5,borderRadius:100,width:80, margin:7,alignContent: 'center'}}><Text numberOfLines={1} style={{color:'#fff',alignSelf:'center'}}>{BASE_CURRENCY}{item.price}</Text></View>
                ) : null}
            </FastImage></TouchableOpacity>
            <TouchableOpacity onPress={() => {
                this.openPlaylist(item.playlist)
            }}><Text numberOfLines={1}  style={{fontSize:15,color:this.theme.blackColor,fontWeight:'500'}}>{item.playlist.name}</Text></TouchableOpacity>
            {(item.user !== undefined) ? (
                <TouchableOpacity onPress={() => {
                    this.openProfile(item.playlist.user);
                }}>
                    <Text numberOfLines={1} note style={{marginTop:5,fontSize:15,fontWeight:'400'}}>{item.playlist.user.full_name}</Text>
                </TouchableOpacity>
            ) : null}
        </View>)
    }

    displayFeedItem(item,index) {
        let title = '';
        item.action = "repost-track";
        if(item.action !== undefined) {
            switch(item.action) {
                case 'posted-album':
                    title = (<Text note><Text note>{lang.getString('posted')}</Text> {lang.getString('an-album')}</Text>);
                    break;
                case 'posted-playlist':
                    title = (<Text note><Text note>{lang.getString('posted')}</Text> {lang.getString('a-playlist')}</Text>);
                    break;
                case 'repost-track':
                    title = (<Text note><Text note>{lang.getString('reposted')}</Text> {lang.getString('a-track')}</Text>);
                    break;
                case 'repost-album':
                    title = (<Text note><Text note>{lang.getString('reposted')}</Text> {lang.getString('an-album')}</Text>);
                    break;
                case 'repost-playlist':
                    title = (<Text note><Text note>{lang.getString('reposted')}</Text> {lang.getString('a-playlist')}</Text>);
                    break;
                case 'posted-track':
                    title = (<Text note><Text note>{lang.getString('posted')}</Text> {lang.getString('a-track')}</Text>);
                    break;
                default:
                    title = (<Text note><Text note>{lang.getString('reposted')}</Text> {lang.getString('this')}</Text>);
                    break;
            }
        }
        return (<Card transparent style={{borderTopColor:this.theme.borderLineColor,borderTopWidth:15,backgroundColor:this.theme.contentVariationBg}}>
            <CardItem header style={{backgroundColor:this.theme.contentVariationBg}}>
                <Left style={{flex:1}}>
                    <FastImage source={{uri: item.reposter.avatar}} style={{width:20,height:20,borderRadius:100}} />
                    <Body>
                    <TouchableOpacity onPress={() => {
                        this.openProfile(item.reposter);
                    }}>
                        <Text><Text style={{fontSize:13,color:this.theme.blackColor}}>{item.reposter.full_name}</Text> {title}</Text>
                    </TouchableOpacity>

                    </Body>
                </Left>
                <View style={{position:'absolute', top:17,right:10}}>
                    <Text note>{Time.ago(item.time)}</Text>
                </View>
            </CardItem>
            <CardItem cardBody header style={{backgroundColor:this.theme.contentVariationBg}}>
                <FastImage source={{uri: item.art_lg}} style={{borderRadius:5,height: 350, width:'95%',resizeMode:'cover',marginTop:5,marginLeft:10,marginRight:10}}>
                    <TouchableOpacity onPress={() => {
                        this.openProfile(item.user)
                    }}>
                    <View style={{alignSelf:'flex-start',flexDirection:'row',maxWidth:'70%',margin:10,marginBottom:2}}>
                        <View style={{backgroundColor:this.theme.accentColor,padding:5}}>
                            <Text style={{color: '#B4B4B4',fontSize:12}}  numberOfLines={1}>{item.user.full_name}</Text>
                        </View>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.play(item, this.state.type, this.state.typeId, index)
                    }}>
                        <View style={{alignSelf:'flex-start',flexDirection:'row',maxWidth:'70%',margin:10,marginTop:3}}>
                            <View style={{backgroundColor:this.theme.accentColor,padding:5}}>
                                <Text style={{color: '#fff',fontWeight:'bold'}}  numberOfLines={1}>{item.title}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                        this.play(item, this.state.type, this.state.typeId, index)
                    }} style={{position:'absolute',left:'35%',top:120, zIndex:9999}}>
                        <View style={{backgroundColor:'rgba(255,255,255,0.7)',width:80,height:80,borderRadius:100,alignContent:'center'}}>
                            <Icon name='play' style={{color:this.theme.accentColor,alignSelf:'center',marginTop:15,marginLeft:9,fontSize:50}} />
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

                        <Icon type="SimpleLineIcons" name="music-tone-alt" style={{color:'#fff',fontSize:20,
                            textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                            marginLeft:7}}/>
                        <Text style={{textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,color:'#fff',marginLeft:-10,fontSize:12,bottom:2,marginRight:7,fontWeight:'bold'}}>{item.viewCount}</Text>

                        <Icon type="SimpleLineIcons" name="loop" style={{color:'#fff',fontSize:20,textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,
                            marginLeft:7}}/>
                        <Text style={{textShadowColor: 'rgba(0, 0, 0, 0.75)',
                            textShadowOffset: {width: -1, height: 1},
                            textShadowRadius: 10,color:'#fff',marginLeft:-10,fontSize:12,bottom:2,marginRight:7,fontWeight:'bold'}}>{item.repostCount}</Text>
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
        </Card>)
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
})(DisplayComponent)