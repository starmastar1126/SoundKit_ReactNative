import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity} from 'react-native';
import {Container,Icon,Button} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import TypingText from 'react-native-typing-text';
import {DEFAULT_HOME, DEFAULT_LANG, LANGUAGES, PUBLIC_ACCESS} from "../config";
import { MenuContext, Menu, MenuOptions, MenuOption, MenuTrigger, renderers } from 'react-native-popup-menu';
import store from "../store";
import storage from "../store/storage";
import FastImage from 'react-native-fast-image'


class HomeScreen extends BaseScreen {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            position : 0,
            image : (this.props.setup !== undefined && this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png"),
            selectedLanguage : this.getCurrentLanguage(),
            typeText : lang.getString("welcome-note")
        }

        setInterval(() => {
            let dPosition = 0;
            let dImage = (this.props.setup !== undefined && this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png");
            if (this.state.position === 0) {
                dPosition = 1;
                dImage = (this.props.setup !== undefined && this.props.setup.slide_image_2) ? this.props.setup.slide_image_2 : require("../images/topo2.png");
            } else if(this.state.position === 1) {
                dPosition = 2;
                dImage = (this.props.setup !== undefined && this.props.setup.slide_image_3) ? this.props.setup.slide_image_3 : require("../images/topo3.png");
            } else if(this.state.position === 2) {
                dPosition = 0;
                dImage = (this.props.setup !== undefined && this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png");
            }
            this.updateState({
                image : dImage,
                position : dPosition
            });
        }, 3000)
    }

    getCurrentLanguage() {
        for (let i=0;i<LANGUAGES.length;i++) {
            if (this.props.language === LANGUAGES[i].key) return LANGUAGES[i];
        }
        return LANGUAGES[0];
    }

    render() {
        const resizeMode = "cover";
        return this.showContent(
            <Container style={{flex: 1}}>
                <View style={{flex: 1}}>
                    {(typeof this.state.image === 'string' && this.state.image.indexOf('http') !== -1) ? (<FastImage
                        style={{flex: 1, resizeMode,width: null, height:null}}
                        source={{
                            uri: this.state.image
                        }}
                        resizeMode={FastImage.resizeMode.cover}
                    />) : (<Image style={{flex: 1, resizeMode,width: null, height:null}} source={this.state.image}/>)}

                    <View style={{position: 'absolute', top: 0, left: 0,right:0,bottom:0,backgroundColor : this.theme.primaryTransparent}}>


                        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 30, paddingTop:10}}>
                            <Image source={require("../images/logo.png")} style={{marginBottom:20,width:300, height: 60, resizeMode: "contain", alignSelf:'center',flex:1}}/>
                            <Button onPress={() => this.props.navigation.navigate('auth',{page : 'login'})} block danger style={{width:'100%',backgroundColor:this.theme.brandPrimary,marginTop:30}}>
                                <Text style={{color:'#FFF',fontSize: 20}}>{lang.getString("login")}</Text>
                            </Button>
                            <Button onPress={() => this.props.navigation.navigate('auth', {page: 'signup'})} block danger style={{width:'100%',backgroundColor:'#FFF',marginTop:10}}>
                                <Text style={{color:this.theme.brandPrimary,fontSize: 20}}>{lang.getString("signup-for-account")}</Text>
                            </Button>
                            <View style={{flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                height:200
                                }}>
                                <TypingText
                                    key = {this.state.typeText}
                                    color="white"
                                    textSize={20}
                                    text = {this.state.typeText}
                                />
                            </View>


                        </View>

                        {PUBLIC_ACCESS ? ( <Button onPress={() => this.props.navigation.navigate(DEFAULT_HOME)} block danger style={{position:'absolute',bottom:0,width:'100%',backgroundColor:'#000'}}>
                            <Text style={{color:'white',fontSize: 20}}>{lang.getString("explore-music")}</Text>
                        </Button>) : null}

                        <View style={{marginTop: (Platform.OS === 'ios') ? 40 : 10,  position: 'absolute', right : 10}}>
                            <Menu>
                                <MenuTrigger>
                                    <View style={{flexDirection:'row',padding:5}}>
                                        <Image source={this.state.selectedLanguage.icon} style={{width:20,height:15,marginTop:2}}/>
                                        <Text style={{color:'#fff', fontSize:15,marginLeft:5}}>{this.state.selectedLanguage.name}</Text>
                                    </View>
                                </MenuTrigger>
                                {this.languageOptions()}

                            </Menu>
                        </View>
                    </View>
                </View>
            </Container>
        )
    }

    languageOptions() {
        let views = [];

        for(let i =0;i<LANGUAGES.length;i++) {
            let lan = LANGUAGES[i];
            views.push(<MenuOption onSelect={() => {
                storage.set("language", lan.key);
                lang.setLanguage(lan.key);
                this.forceUpdate();
                this.updateState({
                    selectedLanguage: lan,
                    typeText: lang.getString('welcome-note')
                });

                this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                        userid : this.props.userid,
                        username : this.props.username,
                        avatar : this.props.avatar,
                        apikey : this.props.apiKey,
                        language: lan.key,
                        theme : this.props.theme,
                        setup : this.props.setup
                    }});


            }}>
                <View style={{flexDirection:'row',padding:5}}>
                    <Image source={lan.icon} style={{width:20,height:15,marginTop:2}}/>
                    <Text style={{fontSize:15,marginLeft:5}}>{lan.name}</Text>
                </View>
            </MenuOption>);
        }

        return (<MenuOptions>{views}</MenuOptions>)
    }
}

export default connect((state) => {
    return {
        userid : state.auth.userid,
        avatar : state.auth.avatar,
        username : state.auth.username,
        apikey : state.auth.apikey,
        language : state.auth.language,
        theme : state.auth.theme,
        setup: state.auth.setup
    }
})(HomeScreen)
