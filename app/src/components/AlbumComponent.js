import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Image,TouchableOpacity,ScrollView,ActivityIndicator,FlatList} from 'react-native';
import {Icon,Button,Card, CardItem, Text, Body,Left,Right} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import { FlatGrid} from 'react-native-super-grid';
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import DummyData from "../utils/DummyData";
import {BASE_CURRENCY, ENABLE_PREMIUM, ENABLEDUMMY, STORE_MODULE} from "../config";
import storage from "../store/storage";
import FastImage from 'react-native-fast-image'
import {offlineSchema} from "../store/realmSchema";

class AlbumComponent extends BaseScreen {
    type = "";
    typeId = "";
    offset = 0;
    limit = 10;
    cacheFilter = "";

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            term : this.props.term
        }
        this.type = this.props.type;
        this.typeId = this.props.typeId
        this.limit = (this.props.limit !== undefined) ? this.props.limit : 10;
        this.cacheFilter = (this.props.cacheFilter !== undefined) ? this.props.cacheFilter : 'playlist';
        this.component = this.props.component;
        this.noCache = (this.props.noCache === undefined) ? false : true
        this.loadLists(false);
    }

    loadLists(paginate) {
        this.updateState({fetchFinished : false});
        let offset = this.offset;
        this.offset = this.limit + this.offset;
        if(!paginate && !this.cacheLoaded) {
            this.cacheLoaded = true;
            if (!this.noCache) {
                Realm.open({path: 'albums.realm', schema: [offlineSchema]}).then(realm => {
                    let name = this.type  + this.typeId + this.cacheFilter;
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
                });
            }
        }

        Api.get("list/playlist", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.type,
            type_id : this.typeId,
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
                    Realm.open({path: 'albums.realm',schema: [offlineSchema]}).then(realm => {
                        realm.write(() => {
                            let name = this.state.type + this.state.typeId + this.cacheFilter;
                            realm.create('offline_schema', {id: name, value: JSON.stringify(lists)}, true);
                        });

                        //realm.close();
                    });
                }
            }
            this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length < 1) ? true : false});
        }).catch(() => {
            this.updateState({fetchFinished: true,itemListNotEnd: true});
        })
    }

    render() {
        return (<FlatGrid
            keyExtractor={(item, index) => item.id}
            items={this.state.itemLists}
            extraData={this.state}
            itemDimension={130}
            spacing={15}
            style={{backgroundColor: this.theme.contentVariationBg}}
            onEndReachedThreshold={.5}
            onEndReached={(d) => {
                if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                    this.loadLists(true);
                }
                return true;
            }}
            fixed={false}
            style={{height:200}}
            ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                {this.state.fetchFinished ? (<Text/>) : (<View style={{justifyContent:"center",alignContent:'center',width:'100%',alignItems:'center'}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>)}
            </View>}
            ListEmptyComponent={!this.state.fetchFinished ? (
                <Text/>
            ) : (<EmptyComponent text={lang.getString('no_playlists_found')}/>)}
            renderItem={({item ,index}) => this.displayGridItem(item,index)}/>);
    }


    displayGridItem(item, index) {
        if (item === false) return null;
        return (<View style={{flex:1}}>
            <TouchableOpacity onPress={() => {
                this.openPlaylist(item)
            }}><FastImage
                style={{width:'100%',height:130,marginBottom:10,borderColor:'#D1D1D1',borderWidth:1}}
                source={{
                    uri: item.art
                }}
                resizeMode={FastImage.resizeMode.cover}
            >
                {this.props.setup.enable_store && item.price > 0 ? (
                    <View style={{backgroundColor:this.theme.brandPrimary,padding:5,borderRadius:100,width:80, margin:7,alignContent: 'center'}}><Text numberOfLines={1} style={{color:'#fff',alignSelf:'center'}}>{BASE_CURRENCY}{item.price}</Text></View>
                ) : null}
            </FastImage></TouchableOpacity>
            <TouchableOpacity onPress={() => {
                this.openPlaylist(item)
            }}><Text numberOfLines={1}  style={{fontSize:15,color:this.theme.blackColor,fontWeight:'500'}}>{item.name}</Text></TouchableOpacity>
        </View>)
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
})(AlbumComponent)