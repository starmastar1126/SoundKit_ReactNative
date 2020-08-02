import React, {Component} from 'react';
import {Platform,View,Image,TouchableOpacity,ScrollView,ActivityIndicator,FlatList} from 'react-native';
import {Icon,Button,Card, CardItem, Text, Input,Container,Item,Content,Header,Textarea,Root} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';
import BaseComponent from "../utils/BaseComponent";
import ToggleSwitch from 'toggle-switch-react-native'
import Toast from 'react-native-toast-native';



class PlaylistAddComponent extends BaseComponent{
    trackId = null;
    component = null;
    constructor(props) {
        super(props);

        this.component = this.props.component;
        this.trackId = this.props.trackId;

        this.state = {
            ...this.state,
            viewType : 1,
            loading : false,
            lists : [],
            loaded : false,
            title : '',
            desc : '',
            pub : 1
        };
        this.loadPlaylists();
    }

    loadPlaylists() {
        Api.get("get/my/playlists", {
            userid : this.props.userid,
            key : this.props.apikey,
            track : this.trackId
        }).then((result) => {
            this.updateState({lists : result,loaded : true})
        }).catch((e) => {
            this.updateState({loaded: true});
        })
    }


    render() {
        return this.showContent(<Container>
            <View style={{ flex: 1,backgroundColor:this.theme.contentVariationBg }}>
                <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
                </Header>
                <View style={{flexDirection: 'column',flex:1}}>
                    <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                        <TouchableOpacity onPress={() => {
                            if (this.state.viewType === 1) {
                                this.component.updateState({playlistModalVisible : false})
                            } else {
                                this.updateState({viewType: 1})
                            }
                        }}>
                            <Icon name="arrow-round-back"  style={{color:this.theme.blackColor, fontSize: 30}}/>
                        </TouchableOpacity>
                        <Text style={{color:this.theme.blackColor, fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('add-to-playlists')}</Text>
                    </View>

                    <View style={{flex: 1}}>
                        {this.state.viewType === 1 ? (<View style={{flexDirection: 'column',flex:1}}>
                            <Content>
                                <View style={{flexDirection:'column', padding:10,borderBottomColor: this.theme.greyColor,borderBottomWidth:.4}}>
                                    <Text style={{color:this.theme.blackColor,fontWeight:'400', fontSize: 15}}>{lang.getString('create-new-playlist').toUpperCase()}</Text>

                                    <TouchableOpacity onPress={() => {this.updateState({viewType: 2})}} style={{marginTop:10}}>
                                        <View style={{flexDirection: 'row',flex:1}}>
                                            <Button light>
                                                <Icon name='plus' type="SimpleLineIcons" />
                                            </Button>

                                            <Text style={{marginLeft: 10,marginTop:7}}>{lang.getString('tap-to-create-new-playlist')}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                <Text style={{margin:10,color: this.theme.blackColor,fontSize:15}}>{lang.getString('add-to-existing-playlist').toUpperCase()}</Text>
                                {this.displayPlaylists()}
                            </Content>
                        </View>) : (<View style={{flexDirection: 'column',flex:1,padding:20}}>
                            <Item>
                                <Input value={this.state.title} onChangeText={(t) => this.updateState({title : t})} placeholder={lang.getString('title')}/>
                            </Item>

                            <Textarea rowSpan={5} style={{marginTop:10}} bordered placeholder={lang.getString('description')} value={this.state.desc} onChangeText={(t) => this.updateState({desc : t})} />



                            <View style={{marginTop: 20,flexDirection: 'row'}}>

                                <ToggleSwitch
                                    isOn={this.state.pub === 1}
                                    onColor={this.theme.brandPrimary}
                                    offColor='lightgrey'
                                    size='medium'
                                    onToggle={ (isOn) => this.updateState({pub: isOn ? 1 : 0}) }
                                />
                                <Text style={{flex: 1, marginLeft: 10}}>{lang.getString('public')}</Text>
                            </View>

                            <Button dark style={{marginTop:20}} small  onPress={() => {
                                this.submitPlaylist();
                            }}>
                                <Text style={{color:'white',marginLeft: 20,marginRight:20}}>{lang.getString('add-playlist')}</Text>
                            </Button>
                        </View>)}
                    </View>
                </View>
            </View>
            <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
        </Container>)
    }

    displayPlaylists() {
        if (!this.state.loaded) return (<View style={{margin:10, alignContent:'center'}}><ActivityIndicator style={{alignSelf:'center'}} size='large' /></View>);
        if (this.state.lists.length < 1) {
            return (<EmptyComponent iconType="SimpleLineIcons" icon="playlist"  text={lang.getString('no-playlists-found')}/>)
        } else {
            let views =[];
            for (let i=0;i<this.state.lists.length;i++) {
                let item = this.state.lists[i];
                views.push(<TouchableOpacity onPress={() => {this.pushToPlaylist(item)}}>
                    <View style={{flexDirection:'row', padding:10}}>
                        <FastImage style={{width:40,height:40,marginTop:4}}
                                   source={{
                                       uri: item.art
                                   }}
                                   resizeMode={FastImage.resizeMode.cover}/>
                        <View style={{flex: 1, flexDirection: 'column', marginLeft:10}}>
                            <Text style={{color:this.theme.blackColor,fontSize:13}}>{item.name}</Text>
                            <Text style={{color:this.theme.brandPrimary, fontSize: 11,marginTop:5}}>{item.count} {lang.getString('songs')}</Text>
                        </View>
                        {item.contain === 1 ? (
                            <Icon name="checkmark-circle" style={{margin:10,color:this.theme.brandPrimary, fontSize:25}}/>
                        ) : null}
                    </View>
                </TouchableOpacity>)
            }

            return (<View style={{flex:1}}>{views}</View>)
        }
    }

    submitPlaylist() {
        if (this.state.title === '') {
            Toast.show(lang.getString('please-enter-playlist-title'), Toast.LONG,Toast.BOTTOM, this.theme.toast.danger);
            return;
        }
        this.updateState({loading : true});
        Api.get('add/playlist', {
            userid : this.props.userid,
            key : this.props.apikey,
            track : this.trackId,
            name : this.state.title,
            desc : this.state.desc,
            access : this.state.pub
        }).then((result) => {
            //force to reload the playlist
            this.updateState({loading : false,viewType: 1, title : '', desc : '', pub : 1});
            this.loadPlaylists();
        })
    }
    pushToPlaylist(item) {
        Toast.show((item.contain === 1) ? lang.getString('removed-from-playlist') : lang.getString('added-to-playlist'),  Toast.LONG,Toast.BOTTOM, this.theme.toast.brand);

        Api.get("add/to/playlist", {
            userid : this.props.userid,
            key : this.props.apikey,
            track : this.trackId,
            playlist : item.id
        }).then((result) => {
            //force to reload the playlist
            this.loadPlaylists();
        })
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
})(PlaylistAddComponent)