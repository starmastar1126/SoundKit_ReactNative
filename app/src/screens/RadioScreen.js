import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Icon,Button,Body,Header,Tab, Tabs, ScrollableTab,TabHeading,Title,Item,Input} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import RadioComponent from '../components/RadioComponent';


class RadioScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = "radios";
        this.state = {
            ...this.state,
            term: '',
        }
    }

    render() {
        return this.show(<Container style={{flex: 1, backgroundColor: this.theme.contentVariationBg}}>
            <Header searchBar rounded hasTabs style={{paddingBottom:0,backgroundColor: this.theme.headerBg,height:65}}>
                <Item style={{backgroundColor:'rgba(0,0,0,0.2)',top:10}}>
                    <Icon style={{color:'#E3E3E3'}} name="ios-search" />
                    <Input style={{color:'#E3E3E3'}} value={this.state.term} onChangeText={(t) => {
                        this.updateState({term : t})
                        this.forceUpdate();
                    }} placeholder={lang.getString('search_radio')} />
                    <Icon style={{color:'#303A4F'}} name="music-tone" type="SimpleLineIcons" />
                </Item>
            </Header>
            {this.state.term === '' ? (
                <Tabs  style={{
                    paddingTop: 0,
                    backgroundColor: this.theme.contentVariationBg,
                    elevation: 0,shadowOffset: {height: 0, width: 0},
                    shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:3,bottom:0}}>
                    <Tab style={{backgroundColor: this.theme.contentVariationBg}} heading={lang.getString('all-stations').toUpperCase()}>
                        <RadioComponent  component={this} player={this.player} navigation={this.props.navigation} limit={15} type={this.state.term ? "search": "all"} typeId={this.state.term}/>
                    </Tab>
                    <Tab heading={lang.getString('top-channels').toUpperCase()}>
                        <RadioComponent component={this} player={this.player} navigation={this.props.navigation} limit={15} type="top" typeId=""/>
                    </Tab>
                </Tabs>
            ) : (<Tabs  style={{
                paddingTop: 0,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:3,bottom:0}}>
                <Tab heading={lang.getString('search-results').toUpperCase()}>
                    <RadioComponent key={this.state.term} noCache={true} component={this} player={this.player} navigation={this.props.navigation} limit={15} type={this.state.term ? "search": "all"} typeId={this.state.term}/>
                </Tab>
            </Tabs>)}
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
})(RadioScreen)