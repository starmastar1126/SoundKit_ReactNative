import React, {Component} from 'react';
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Footer, FooterTab, Button, Icon,Content,Badge,Header} from 'native-base';
import lang from "../utils/lang";
import {DEFAULT_LANG} from "../config";
import {Root,StyleProvider} from 'native-base';
import getTheme from "../../native-base-theme/components";
import plaform from "../../native-base-theme/variables/platform";
import light from "../themes/light";
import dark from "../themes/dark";
import Player from "./Player";
import update from "immutability-helper";
import FastImage from 'react-native-fast-image';
import { MaterialDialog } from 'react-native-material-dialog';
import Modal from "react-native-modal";


class BaseComponent extends Component {
    activeMenu = "explore";
    theme = light;
    device = "ios";
    cacheLoaded = false;
    player  = null;
    constructor(props) {
        super(props);
        this.device = Platform.OS === 'ios' ? 'ios' : 'android';

        if (this.props.language !== undefined) {
            lang.setLanguage(this.props.language);
        } else {
            lang.setLanguage(DEFAULT_LANG);
        }

        this.component = this;

        if (this.props.navigation !== undefined) {
            this.props.navigation.addListener('didFocus', (status: boolean) => {
                this.updateState({player : (this.player.track !== null) ? true : false})
                this.player.updateComponent(this.component);
                this.updateState({
                    playing : this.player.playing,
                    isPaused: this.player.isPaused
                })
            });
        }

        if (this.props.player !== undefined) {
            this.player = this.props.player;
        } else if(this.props.navigation !== undefined && this.props.navigation.getParam('player', null) !== null) {

            this.player = this.props.navigation.getParam('player', null);
        } else {
            this.player = new Player(this);
        }
        if (this.props.theme !== undefined && this.props.theme !== null) {
            switch(this.props.theme) {
                case 'light':
                    theme = light;
                    break;
                case 'dark':
                    theme = dark;
                    break
            }
        }


        this.state = {
            notifications : 0,
            fetching : false,
            refreshing : false,
            itemDetails : null,
            itemLists : [],
            itemListNotEnd : false,
            fetchFinished : false,
            player: (this.player.track !== null) ? true : false,
            playing : this.player.playing,
            isPaused : this.player.isPaused,
            loginAlertVisible : false,
            playlistModalVisible : false,
            playlistTrackId: null
        }

        this.player.updateComponent(this);
    }

    componentWillMount(){

    }

    showContent(jsx) {
        return (<StyleProvider style={getTheme(this.theme)}>
            <Container>{!this.isLoggedIn() ? (
                <MaterialDialog
                    title={lang.getString('you-need-login')}
                    visible={this.state.loginAlertVisible}
                    okLabel={lang.getString("login")}
                    cancelLabel={lang.getString('cancel')}
                    onOk={() => this.setState({ loginAlertVisible: false })}
                    onCancel={() => this.setState({ loginAlertVisible: false })}/>
            ) : null}
                {jsx}</Container>
        </StyleProvider>)
    }

    show(jsx) {
        return (<StyleProvider style={getTheme(this.theme)}><Container>
            {!this.isLoggedIn() ? (
                <MaterialDialog
                    title={lang.getString('you-need-login')}
                    visible={this.state.loginAlertVisible}
                    okLabel={lang.getString("login")}
                    cancelLabel={lang.getString('cancel')}
                    onOk={() => this.setState({ loginAlertVisible: false })}
                    onCancel={() => this.setState({ loginAlertVisible: false })}/>
            ) : null}
            <View style={{flex:1}}>
                {jsx}
            </View>
            {this.state.player ? (<FastImage source={{uri: this.player.track.art}} style={{width: '100%',height: 50, backgroundColor: 'red'}}>
                <TouchableOpacity onPress={() => {
                    this.play(this.player.track, this.player.type,this.player.typeId);
                }} style={{flex:1}}>
                    <View style={{backgroundColor: 'rgba(0,0,0,0.8)', flex:1, flexDirection:'row',padding:5}}>
                        <FastImage source={{uri: this.player.track.art}} style={{width:30,height:30,marginTop:4}}/>
                        <View style={{flexDirection: 'column', marginLeft:5,paddingRight:13, flex: 1}}>
                            <Text numberOfLines={1} style={{color:'white', fontSize: 15,fontWeight:'500'}}>{this.player.track.title}</Text>
                            <Text  numberOfLines={1} style={{color:'white', fontSize: 12,marginTop:5}}>{this.player.track.reposter.full_name}</Text>
                        </View>

                        <TouchableOpacity onPress={() => {
                            this.validatePlayer();
                            this.player.togglePlay()
                        }} style={{position:'absolute', right:10, top:15}}>
                            {!this.state.isPaused ? (
                                <Icon name="control-pause" type="SimpleLineIcons" style={{fontSize:20,color:'#fff'}}/>
                            ) : (
                                <Icon name="control-play" type="SimpleLineIcons" style={{fontSize:20,color:'#fff'}}/>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </FastImage>) : null}
            <Footer>
                <FooterTab>
                    <Button vertical onPress={() => this.props.navigation.navigate('feed', {player : this.player})} active={(this.activeMenu === "feed") ? true : false}>
                        <Icon  type="SimpleLineIcons" name="energy" />

                    </Button>
                    <Button vertical onPress={() => this.props.navigation.navigate('explore', {player : this.player})} active={(this.activeMenu === "explore") ? true : false}>
                        <Icon  type="SimpleLineIcons" name="magnifier" />
                    </Button>
                    <Button vertical onPress={() => this.props.navigation.navigate('store', {player : this.player})} active={(this.activeMenu === "store") ? true : false}>
                        <Icon  type="SimpleLineIcons" active name="basket-loaded" />
                    </Button>
                    <Button vertical onPress={() => this.props.navigation.navigate('collection', {player : this.player})} active={(this.activeMenu === "collection") ? true : false}>
                        <Icon  type="SimpleLineIcons" name="playlist" />
                    </Button>
                    {this.props.userid !== null && this.props.userid !== '' ? (<Button vertical badge={this.state.notifications > 0 ? true : false} onPress={() => this.props.navigation.navigate('account', {player : this.player})} active={(this.activeMenu === "menu") ? true : false}>
                        {this.state.notifications > 0 ? (
                            <Badge danger><Text style={{color:'white'}}>{this.state.notifications}</Text></Badge>
                        ) : null}
                        <Icon  type="SimpleLineIcons" name="menu" />
                    </Button>) : null}
                </FooterTab>
            </Footer>
        </Container></StyleProvider>);
    }

    updateState(va) {
        this.setState(va);
    }
    addToPlaylist(track) {
        if (!this.isLoggedIn()) return this.showLoginAlert();
        this.updateState({
            playlistTrackId: track,
            playlistModalVisible : true
        })
    }

    play(item, type, typeId) {

        this.props.navigation.navigate("player", {
            item : item,
            type : type,
            typeId : typeId,
            component : this,
            player : this.player
        })
    }

    validatePlayer() {
        this.player.updateComponent(this);
    }

    minimizePlayer(player) {
        this.player = player;
        this.updateState(update(this.state, {
            player : {$set : true}
        }));
    }

    isLoggedIn() {
        return (!(this.props.userid === '' || this.props.userid === null));
    }

    gotoLogin() {
        this.props.navigation.navigate("auth")
    }

    showLoginAlert() {
        this.updateState({
            loginAlertVisible: true
        });
    }
}

export default BaseComponent;