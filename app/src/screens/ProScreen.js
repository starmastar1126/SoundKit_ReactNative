import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Icon,Button,Form, Item, Input, Label} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";

class ProScreen extends BaseScreen {

    constructor(props) {
        super(props);
    }

    render() {
        return this.show(<Container style={{flex: 1}}>

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
})(ProScreen)