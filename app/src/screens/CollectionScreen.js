import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Icon,Button,Form, Item, Input, Label,Header,Tab, Tabs, ScrollableTab,Title} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import light from "../themes/light";
import DisplayComponent from '../components/DisplayComponent';
import VideoComponent from '../components/VideoComponent'
import AlbumComponent from '../components/AlbumComponent'


class CollectionScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = 'collection';
    }

    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Header searchBar rounded hasTabs style={{paddingBottom:0,backgroundColor: this.theme.headerBg,height:0}}>
            </Header>
            <Tabs renderTabBar={()=> <ScrollableTab style={{borderBottomWidth:0,borderTopWidth:0,borderColor:light.headerBorderTopColor}} />}  style={{
                paddingTop: 0,
                backgroundColor:this.theme.contentVariationBg,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:3,bottom:0}}>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('listen-later').toUpperCase()}>
                    <DisplayComponent key="listen-later" player={this.player} navigation={this.props.navigation} limit={10} type="listen-later" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('offline').toUpperCase()}>
                    <DisplayComponent key='offline' player={this.player} navigation={this.props.navigation} limit={10} type="offline" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('history').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="history" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('likes').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="likes" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('playlists').toUpperCase()}>
                    <AlbumComponent player={this.player} navigation={this.props.navigation}  type="playlist" typeId="collection"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('albums').toUpperCase()}>
                    <AlbumComponent player={this.player} navigation={this.props.navigation}  type="album"  typeId="collection"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('watch-later').toUpperCase()}>
                    <VideoComponent player={this.player} navigation={this.props.navigation} limit={10} type="later" typeId=""/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('watch-history').toUpperCase()}>
                    <VideoComponent player={this.player} navigation={this.props.navigation} limit={10} type="history" typeId=""/>
                </Tab>
            </Tabs>
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
})(CollectionScreen)