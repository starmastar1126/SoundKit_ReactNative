import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Icon,Button,Form, Item, Input, Label,Header,Tab, Tabs, ScrollableTab,Title} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import light from "../themes/light";
import DisplayComponent from '../components/DisplayComponent';
import VideoComponent from '../components/VideoComponent'

class StoreScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = 'store';
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
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('new-music').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="store-browse" typeId="tracks-all" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('best-of-week').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="store-best-week" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('videos').toUpperCase()}>
                    <VideoComponent component={this} player={this.player} navigation={this.props.navigation} limit={10} type="latest" typeId="1"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('top-songs').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="store-top-songs" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('top-albums').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="store-top-albums" typeId="" displayType="vertical-album-grid"/>
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
})(StoreScreen)