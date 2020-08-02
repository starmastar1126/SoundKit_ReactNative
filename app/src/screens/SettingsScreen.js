import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share,Linking} from 'react-native';
import {Container,Icon,Button,Header,Content, Form,Input,Label,Item,Toast} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../api";


class SettingsScreen extends BaseScreen {

    constructor(props) {
        super(props);

        this.user = this.props.navigation.getParam("detail");
        this.state = {
            ...this.state,
            name : this.user.full_name,
            bio : this.user.bio,
            website : this.user.website,
            city : this.user.city,
            twitter : this.user.twitter,
            facebook : this.user.facebook,
            youtube : this.user.youtube,
            vimeo : this.user.vimeo,
            soundcloud : this.user.soundcloud,
            instagram : this.user.instagram,
            loading : false,
        }
    }

    save() {
        if (this.state.name === '') {
            Toast.show({
                text : lang.getString('your-name-cannot-empty'),
                type : 'danger'
            });
            return;
        }

        Api.get("account/save", {
            userid : this.props.userid,
            key : this.props.apikey,
            name : this.state.name,
            website : this.state.website,
            city : this.state.city,
            bio : this.state.bio,
            facebook : this.state.facebook,
            twitter : this.state.twitter,
            instagram : this.state.instagram,
            soundcloud : this.state.soundcloud,
            youtube : this.state.youtube,
            vimeo : this.state.vimeo
        }).then((r) => {
            Toast.show({
                text : lang.getString('account-settings-saved')
            })
        })
    }

    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Icon name="arrow-round-back"  style={{color:this.theme.blackColor, fontSize: 30}}/>
                </TouchableOpacity>
                <Text style={{color:this.theme.blackColor, fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('edit-profile')}</Text>
            </View>
            <Content>
                <Form style={{padding : 20}}>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("full-name")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.name} onChangeText={(t) => this.updateState({name : t})}/>
                    </Item>

                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("bio")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.bio} onChangeText={(t) => this.updateState({bio : t})}/>
                    </Item>

                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("city")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.city} onChangeText={(t) => this.updateState({city : t})}/>
                    </Item>

                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("facebook-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.facebook} onChangeText={(t) => this.updateState({facebook : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("twitter-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.twitter} onChangeText={(t) => this.updateState({twitter : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("instagram-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.instagram} onChangeText={(t) => this.updateState({instagram : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("soundcloud-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.soundcloud} onChangeText={(t) => this.updateState({soundcloud : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("vimeo-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.vimeo} onChangeText={(t) => this.updateState({vimeo : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("youtube-handle")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.youtube} onChangeText={(t) => this.updateState({youtube : t})}/>
                    </Item>
                    <Item floatingLabel style={{marginBottom: 20}}>
                        <Label style={{color:this.theme.blackColor}} >{lang.getString("website")}</Label>
                        <Input style={{color:this.theme.blackColor}} value={this.state.website} onChangeText={(t) => this.updateState({website : t})}/>
                    </Item>
                    <Button onPress={() => this.save()} primary small style={{backgroundColor: this.theme.brandPrimary}}><Text style={{marginLeft:10,marginRight:10,color:'#fff'}}> {lang.getString('save-settings')} </Text></Button>
                </Form>


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
})(SettingsScreen)