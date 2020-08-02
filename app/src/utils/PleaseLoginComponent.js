import React,{Component} from 'react';
import {View,Text,TouchableOpacity} from 'react-native';
import {
    Icon
} from 'native-base';
import light from "../themes/light";
import lang from "./lang";
import BaseScreen from "./BaseScreen";

export default class PleaseLoginComponent extends BaseScreen {
    render() {
        return (
            <View style={{flex:1, flexDirection: 'column', justifyContent: 'center',alignContent: 'center',
                paddingTop:this.props.paddingTop !== undefined ? this.props.paddingTop : 100 }}>
                <Icon  name="login"
                       type="SimpleLineIcons"
                       style={{alignSelf:'center',fontSize:40,color: this.theme.brandPrimary,marginBottom: 15}}/>
                <Text style={{alignSelf:'center',fontSize:15,color:'grey',fontWeight:'bold'}}>{lang.getString("you-need-login")}</Text>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.navigate('auth')
                }}>
                    <Text style={{alignSelf:'center',fontSize:20,color: this.theme.brandPrimary,marginTop: 15}}>{lang.getString('click-here-tologin')}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}