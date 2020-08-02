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

class RadioComponent extends BaseScreen {
    type = "";
    typeId = "";
    offset = 0;
    limit = 10;
    cacheFilter = "radios";

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            type : this.props.type,
            typeId : this.props.typeId,
        }
        this.limit = (this.props.limit !== undefined) ? this.props.limit : 10;
        this.cacheFilter = (this.props.cacheFilter !== undefined) ? this.props.cacheFilter : 'radios';
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
                Realm.open({path: 'radios.realm', schema: [offlineSchema]}).then(realm => {
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

        Api.get("radio", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.state.type,
            type_id : this.state.typeId,
            offset : offset,
            limit : this.limit,
            platform: (Platform.OS === 'ios') ? 'ios' : 'android'
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {


                lists.push(...result);
                Realm.open({path: 'radios.realm',schema: [offlineSchema]}).then(realm => {
                    realm.write(() => {
                        let name = this.state.type + this.state.typeId + this.cacheFilter;
                        realm.create('offline_schema', {id: name, value: JSON.stringify(lists)}, true);
                    });

                    //realm.close();
                });
            }
            this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length < 1) ? true : false});
        }).catch(() => {
            this.updateState({fetchFinished: true,itemListNotEnd: true});
        })
    }

    render() {
        return this.minContent(<FlatGrid
            keyExtractor={(item, index) => item.id}
            items={this.state.itemLists}
            extraData={this.state}
            itemDimension={130}
            spacing={15}
            style={{backgroundColor:this.theme.contentVariationBg}}
            onEndReachedThreshold={.5}
            onEndReached={(d) => {
                if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd) {
                    this.loadLists(true);
                }
                return true;
            }}
            fixed={false}
            ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                {this.state.fetchFinished ? (<Text/>) : (<View style={{justifyContent:"center",alignContent:'center',width:'100%',alignItems:'center'}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>)}
            </View>}
            ListEmptyComponent={!this.state.fetchFinished ? (
                <Text/>
            ) : (<EmptyComponent text={lang.getString('no_radios_found')}/>)}
            renderItem={({item ,index}) => this.displayItem(item,index, true)}/>);
    }


    displayItem(item, index) {
        if (item === false) return null;
        return (<View style={{flex:1}}>
            <TouchableOpacity onPress={() => {
                this.play(item, 'radio', '', index)
            }}><FastImage
                style={{width:'100%',height:150,marginBottom:10,borderColor:'#D1D1D1',borderWidth:1}}
                source={{
                    uri: item.art
                }}
                resizeMode={FastImage.resizeMode.cover}
            >
                {this.props.setup.enable_store && item.price > 0 ? (
                    <View style={{backgroundColor:this.theme.brandPrimary,padding:5,borderRadius:100,width:80, margin:7,alignContent: 'center',position:'absolute', left : 0, top: 0}}><Text numberOflines={1} style={{color:'#fff',alignSelf:'center'}}>{BASE_CURRENCY}{item.price}</Text></View>
                ) : null}
                <View style={{width:70,height:70,borderColor:'#fff',borderWidth:1, padding:16,borderRadius: 100,alignSelf:'center', marginTop: 50}}>
                    <Icon name="play" style={{color:'#fff', fontSize:30,marginLeft:10}} type="FontAwesome"/>
                </View>
            </FastImage></TouchableOpacity>
            <TouchableOpacity onPress={() => {
                this.play(item, this.state.type, this.state.typeId)
            }}><Text numberOfLines={1}  style={{fontSize:15,color:this.theme.blackColor,fontWeight:'500'}}>{item.title}</Text></TouchableOpacity>
            {(item.user !== undefined) ? (
                <Text numberOfLines={1} note style={{marginTop:5,fontSize:15,fontWeight:'400'}}>{item.user.full_name}</Text>
            ) : null}
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
})(RadioComponent)