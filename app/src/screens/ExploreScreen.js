import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, StyleSheet,ActivityIndicator} from 'react-native';
import {Container,Icon,Button,Form,Content, Item, Input, Label,Header,Tab, Tabs, ScrollableTab,TabHeading,Picker} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import light from "../themes/light";
import DisplayComponent from '../components/DisplayComponent';
import PeopleComponent from '../components/PeopleComponent';
import AlbumComponent from '../components/AlbumComponent'
import update from "immutability-helper/index";

class ExploreScreen extends BaseScreen {

    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            term : ''
        }
        this.loadGenres();
    }

    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Header searchBar rounded hasTabs style={{paddingBottom:20,backgroundColor: this.theme.headerBg,height:65}}>
                <Item style={{backgroundColor:'rgba(0,0,0,0.2)',top:10}}>
                    <Icon style={{color:'#E3E3E3'}} name="ios-search" />
                    <Input style={{color:'#E3E3E3'}} value={this.state.term} onChangeText={(t) => {
                        this.updateState({term : t})
                        this.forceUpdate();
                    }} placeholder={lang.getString('search_placeholder')} />
                    <Icon style={{color:'#303A4F'}} name="music-tone" type="SimpleLineIcons" />
                </Item>
            </Header>
            {this.state.term === '' ? (<Tabs locked={(Platform.OS === 'ios') ? false : true} renderTabBar={()=> <ScrollableTab style={{borderBottomWidth:0,borderTopWidth:0,borderColor:light.headerBorderTopColor}} />}  style={{
                paddingTop: 0,
                backgroundColor:this.theme.contentVariationBg,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:3,bottom:0}}>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('explore').toUpperCase()}>
                    <DisplayComponent player={this.player} navigation={this.props.navigation} limit={10} type="latest" typeId="" displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('genres').toUpperCase()}>
                    <Content>
                        {this.displayGenres()}
                    </Content>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('artists').toUpperCase()}>
                    <PeopleComponent type="artists" player={this.player} navigation={this.props.navigation} limit={10}/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('playlists').toUpperCase()}>
                    <AlbumComponent player={this.player} navigation={this.props.navigation}  type="playlist" typeId="discover"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('albums').toUpperCase()}>
                    <AlbumComponent player={this.player} navigation={this.props.navigation}  type="album"  typeId="discover"/>
                </Tab>
            </Tabs>) : (<Tabs renderTabBar={()=> <ScrollableTab style={{borderBottomWidth:0,borderTopWidth:0,borderColor:light.headerBorderTopColor}} />}  style={{
                paddingTop: 0,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:0,top:-1}}>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('tracks').toUpperCase()}>
                    <DisplayComponent noCache={true} key={this.state.term} player={this.player} navigation={this.props.navigation} limit={10} type="search" typeId={this.state.term} displayType="vertical-grid"/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('people').toUpperCase()}>
                    <PeopleComponent noCache={true} key={this.state.term}  type="people" term={this.state.term} player={this.player} navigation={this.props.navigation} limit={10}/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('artists').toUpperCase()}>
                    <PeopleComponent noCache={true} key={this.state.term}  type="artists" term={this.state.term} player={this.player} navigation={this.props.navigation} limit={10}/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('playlists').toUpperCase()}>
                    <AlbumComponent noCache={true} key={this.state.term}  player={this.player} navigation={this.props.navigation}  type="playlist" typeId={'search-' + this.state.term}/>
                </Tab>
                <Tab style={{backgroundColor:this.theme.contentVariationBg}} heading={lang.getString('albums').toUpperCase()}>
                    <AlbumComponent noCache={true} key={this.state.term}  player={this.player} navigation={this.props.navigation}  type="album"  typeId={'search-' + this.state.term}/>
                </Tab>
            </Tabs>)}
        </Container>)
    }

    displayGenres() {
        if (this.state.genres.length > 0) {
            let result = this.state.genres;
            let content = [];
            for (let i = 0; i < result.length;i++) {
                let genre = result[i];
                content.push(<View style={{backgroundColor:this.theme.contentVariationBg}}>
                    <View style={{borderBottomWidth:10,borderBottomColor:this.theme.borderLineColor}}>
                        <Text style={{fontSize:17,fontWeight:'500',margin:10,color:this.theme.brandPrimary}}>{genre.name}</Text>
                        <DisplayComponent  player={this.player}  navigation={this.props.navigation}  limit={4} type="genre" typeId={genre.id} displayType="horizontal-grid"/>
                    </View>
                </View>);
            }
            return (<View>{content}</View>);
        }
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
})(ExploreScreen)