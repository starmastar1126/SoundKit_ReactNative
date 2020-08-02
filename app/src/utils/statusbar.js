import React, {Component} from 'react';

import {View,StyleSheet,Platform,Text} from 'react-native';
import material from "../../native-base-theme/variables/material";
import BaseScreen from "./BaseScreen";


export default class StatusBarBackground extends BaseScreen{
    render(){
        return(
            <View style={{height: (Platform.OS === 'ios') ? 18 : 0, backgroundColor:this.theme.statusColor,zIndex:11}}/>
        );
    }
}