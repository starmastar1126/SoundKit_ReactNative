import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView,StyleSheet} from 'react-native';
import {Container,Icon,Button,Form, Item, Input, Label} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import AppIntroSlider from 'react-native-app-intro-slider';
import storage from "../store/storage";

const styles = StyleSheet.create({
    image: {
        width: 320,
        height: 320,
    }
});
class WelcomeScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = "menu";
    }

    render() {
        const slides = [{
            key: '1',
            title: lang.getString("welcome"),
            text: lang.getString("good-to-see-you-note"),
            image: require('../images/pattern.png'),
            imageStyle: {
                height: 80 * 2.5,
                width: 109 * 2.5,
            },
            backgroundColor: this.theme.brandPrimary,
        },{
            key: '2',
            title: lang.getString("explore"),
            text: lang.getString("explore-music-note"),
            image: require('../images/peoplemusic.png'),
            imageStyle: {
                height: 80 * 2.5,
                width: 109 * 2.5,
            },
            backgroundColor: this.theme.brandPrimary,
        }];

        return (<AppIntroSlider slides={slides} onDone={this._onDone}/>)
    }

    _onDone = () => {
        storage.set('did_getstarted', '1');
        this.props.navigation.navigate("feed");
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
})(WelcomeScreen)