import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share,Linking} from 'react-native';
import {Container,Icon,Button,Header,Content, List, ListItem, Left, Body,Right,Badge} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import light from "../themes/light";
import storage from "../store/storage";
import {NavigationActions,StateUtils,StackActions} from 'react-navigation'
import ToggleSwitch from 'toggle-switch-react-native'
import {APP_LINK, CONTACT_LINK, ENABLE_BLOG_PLUGIN, ENABLE_PREMIUM, PRIVACY_LINK, TERMS_LINK} from "../config";
import dark from "../themes/dark";
import Api from "../api";
import RNRestart from 'react-native-restart';
class AccountScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = "menu";
        this.state = {
            ...this.state,
            dark : (this.props.theme === 'dark') ? true : false,
            details : null,
            toggle : true
        }

        if (this.props.userid !== null) this.loadDetails();
    }

    loadDetails() {
        Api.get('user/detail', {
            id : this.props.userid,
            userid : this.props.userid,
            key : this.props.apikey,
        }).then((r) => {
            this.updateState({details: r});
        })
    }

    changeTheme(theme) {
        if (theme === 'dark') {
            this.theme = dark

        } else {
            this.theme = light;
        }

        storage.set('theme', theme);
        storage.set('changetheme', '1');
        this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                userid : this.props.userid,
                username : this.props.username,
                password : this.props.password,
                avatar : this.props.avatar,
                cover : this.props.cover,
                key : this.props.key,
                language: this.props.language,
                theme : theme,
                setup : this.props.setup
            }});
        this.forceUpdate();
       setTimeout(() => {
           RNRestart.Restart();
       }, 300)
    }

    render() {
        return this.show(<Container style={{flex: 1}}>
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.accentColor,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.accentColor, padding:10, flexDirection:'row'}}>
                <Text style={{color:'#fff', fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('account-menu')}</Text>

                {this.props.userid !== null  ? (<View style={{position:'absolute', right : 0,flexDirection:'row'}}>
                    <Button onPress={() => {
                        this.props.navigation.navigate('notifications');
                    }} transparent>
                        <Icon style={{color:'#fff'}} name='notifications' />
                        {(this.state.countNotifications > 0) ? (<Badge danger style={{position:'absolute', left : 0,top:2}}>
                            <Text style={{color:'#fff'}}>{(this.state.countNotifications > 99) ? '99+' : this.state.countNotifications}</Text>
                        </Badge>) : null}
                    </Button>

                    <Button transparent onPress={() => {
                        this.props.navigation.navigate('messages');
                    }} >
                        <Icon style={{color:'#fff'}} name='envelope' type="SimpleLineIcons" />
                        {this.state.countMessages > 0 ? (<Badge danger style={{position:'absolute', left : 0,top:2}}>
                            <Text style={{color:'#fff'}}>{this.state.countMessages > 99 ? '99+' : this.state.countMessages}</Text>
                        </Badge>) : null}
                    </Button>
                </View>) : null}
            </View>
            <Content style={{backgroundColor: this.theme.contentVariationBg}}>
                <View style={{flex:1,flexDirection:'row',marginBottom:10,padding:10}}>
                    <View style={{flexDirection: 'row',flex:1}}>
                        {this.props.userid !== null ? (
                            <TouchableOpacity onPress={() => {
                                if (this.state.details != null) this.openProfile(this.state.details);
                            }}>
                                <View style={{flexDirection: 'row',flex:1}}>
                                    <FastImage
                                        style={{width:70,height:70,borderRadius:10}}
                                        source={{
                                            uri: this.props.avatar
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                    />

                                    <Text style={{fontSize:20,fontWeight:'500',color:this.theme.blackColor,marginTop:15,marginLeft: 10}}>{this.props.username}</Text>

                                </View>
                            </TouchableOpacity>
                        ): (
                            <View style={{padding:20, alignContent:'center'}}>
                                <Button onPress={() => {
                                    this.props.navigation.navigate('auth')
                                }} style={{backgroundColor:this.theme.brandPrimary, fontSize: 15,alignSelf:'center'}}><Text style={{color:'#fff',marginLeft: 20, marginRight: 20}}>{lang.getString('sign-login-for-account')}</Text></Button>
                            </View>
                        )}
                    </View>



                    {this.props.userid !== null && this.props.setup.premium_account && this.state.details !== null && this.state.details.has_premium === 0? (
                        <View style={{padding: 10}}>
                            <Button onPress={() => {
                                this.props.navigation.navigate('pricing',{
                                    component : this
                                })
                            }} style={{backgroundColor:this.theme.brandPrimary, fontSize: 15}}><Text style={{color:'#fff',marginLeft: 20, marginRight: 20}}>{lang.getString('go-premium')}</Text></Button>
                        </View>
                    ) : null}
                </View>

                <ListItem itemDivider style={{backgroundColor: this.theme.contentVariationBorderColor}} />
                <ListItem  style={{borderColor: this.theme.contentVariationBorderColor}}  onPress={() => {

                }}>
                    <Left>
                        <Text style={{marginLeft: 10,color:this.theme.blackColor,marginTop:9}}>{(!this.state.dark) ? lang.getString('light') : lang.getString('dark')} {lang.getString('mode')}</Text>
                    </Left>
                    <Right>
                        <ToggleSwitch
                            isOn={this.state.dark}
                            onColor={this.theme.brandPrimary}
                            offColor='lightgrey'
                            size='medium'
                            onToggle={ (isOn) => {
                                this.updateState({dark: isOn ? true : false});
                                this.changeTheme(isOn ? 'dark' : 'light');
                            }}
                        />
                    </Right>
                </ListItem>
                {this.props.userid !== null && this.state.details !== null ? (<View>
                    <ListItem itemDivider style={{backgroundColor: this.theme.contentVariationBorderColor}} >
                    </ListItem>
                    <ListItem  style={{borderColor: this.theme.contentVariationBorderColor}}  onPress={() => {
                        this.props.navigation.navigate('settings', {player : this.player, detail : this.state.details});
                    }}>
                        <Left>
                            <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('edit-profile')}</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>

                    <ListItem style={{borderColor: this.theme.contentVariationBorderColor}}  onPress={() => {
                        Share.share({
                            message: lang.getString('share-profile'),
                            url: this.state.details.link,
                            title: lang.getString('share-profile')
                        }, {
                            // Android only:
                            dialogTitle: lang.getString('share-profile'),
                        })
                    }}>
                        <Left>
                            <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('share-profile')}</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>
                </View>) : null}

                <ListItem itemDivider style={{backgroundColor: this.theme.contentVariationBorderColor}}>
                </ListItem>

                <ListItem style={{borderColor: this.theme.contentVariationBorderColor}}  onPress={() => {
                    this.props.navigation.navigate('explore', {player : this.player});
                }}>
                    <Left>
                        <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('explore')}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
                    </Right>
                </ListItem>

                {this.props.setup.enable_blogs ? (
                    <ListItem style={{borderColor: this.theme.contentVariationBorderColor}} onPress={() => {
                        this.props.navigation.navigate('blogs', {player : this.player});
                    }}>
                        <Left>
                            <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('articles')}</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>
                ) : null}

                <ListItem style={{borderColor: this.theme.contentVariationBorderColor}}  onPress={() => {
                    Share.share({
                        message: lang.getString('share-this-app'),
                        url: APP_LINK,
                        title: lang.getString('share-this-app')
                    }, {
                        // Android only:
                        dialogTitle: lang.getString('share-this-app'),
                    })
                }}>
                    <Left>
                        <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('share-this-app')}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
                    </Right>
                </ListItem>

                {this.props.setup.privacy_link ? (<ListItem style={{borderColor: this.theme.contentVariationBorderColor}} onPress={() => {
                    Linking.openURL(this.props.setup.privacy_link);
                }}>
                    <Left>
                        <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('privacy-policy')}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
                    </Right>
                </ListItem>) : null}

                {this.props.setup.terms_link ? (<ListItem style={{borderColor: this.theme.contentVariationBorderColor}} onPress={() => {
                    Linking.openURL(this.props.setup.terms_link);
                }} >
                    <Left>
                        <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('terms-and-condition')}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
                    </Right>
                </ListItem>) : null}

                {this.props.setup.contact_link ? (<ListItem style={{borderColor: this.theme.contentVariationBorderColor}} onPress={() => {
                    Linking.openURL(this.props.setup.contact_link);
                }}>
                    <Left>
                        <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('contact-us')}</Text>
                    </Left>
                    <Right>
                        <Icon name="arrow-forward" />
                    </Right>
                </ListItem>) : null}

                {this.props.userid !== null ? (<View>
                    <ListItem itemDivider style={{backgroundColor: this.theme.contentVariationBorderColor}}>
                    </ListItem>
                    <ListItem style={{borderColor: this.theme.contentVariationBorderColor}} onPress={() => {
                        storage.logout();
                        setTimeout(() => {
                            RNRestart.Restart();
                        }, 200);
                        this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                                userid : null,
                                username : null,
                                password : null,
                                avatar : null,
                                cover : null,
                                key : null,
                                language: this.props.language,
                                theme : this.props.theme
                            }});
                        const resetAction = StackActions.reset({
                            index: 0,
                            actions: [NavigationActions.navigate({ routeName: 'start' })],
                        });
                        this.props.navigation.dispatch(resetAction);
                    }}>
                        <Left>
                            <Text style={{color:this.theme.blackColor,fontSize:20}}>{lang.getString('logout')}</Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>
                </View>) : null}
            </Content>
        </Container>)
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
})(AccountScreen)