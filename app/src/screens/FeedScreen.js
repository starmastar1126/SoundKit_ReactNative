import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView,NetInfo} from 'react-native';
import {Container,Icon,Button,Content,Left,Right,Title,Body,Header,Tab,Badge, Tabs, ScrollableTab,TabHeading,Item,Input} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import light from "../themes/light";
import DisplayComponent from '../components/DisplayComponent';
import PleaseLoginComponent from "../utils/PleaseLoginComponent";
import Api from "../api";
import update from 'immutability-helper';
import VideoComponent from '../components/VideoComponent'
import storage from "../store/storage";
import dark from "../themes/dark";
import {
    AdMobBanner
} from 'react-native-admob'
import {ADMOB_ID} from "../config";
class FeedScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = "feed";
        this.state = {
            ...this.state,
            genres : []
        }

        this.props.navigation.addListener('didFocus', (status: boolean) => {
            this.updateState({player : (this.player.track !== null) ? true : false});
            this.player.updateComponent(this.component);
            this.updateState({
                playing : this.player.playing,
                isPaused: this.player.isPaused
            })

            this.checkAuth();
        });

        this.loadGenres();
    }

    render() {
        return this.show(<Container style={{flex: 1}}>
            <Header searchBar rounded hasTabs style={{paddingBottom:20,backgroundColor: this.theme.headerBg,height:65}}>
                <Item  style={{backgroundColor:'rgba(0,0,0,0.2)',top:10}}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('explore', {player : this.player})}>
                        <View style={{flexDirection: 'row'}}>
                            <Icon name="ios-search" style={{color:'#E3E3E3'}}/>
                            <Text style={{color:'#E3E3E3', fontSize:15,marginTop:3}}>{lang.getString('search_placeholder')}</Text>
                        </View>
                    </TouchableOpacity>
                </Item>
                {this.isLoggedIn() ? (<View style={{flexDirection: 'row'}}>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('notifications',  {player : this.player})} transparent style={{position:'relative', top: 12,marginLeft:7, marginRight:10}}>

                        <Icon name='bell' type="SimpleLineIcons" style={{color:'#fff',fontSize:20}} />
                        {this.state.notifications > 0 ? (
                            <View style={{position:'absolute', top:-5, right:0,width:10,height:10,borderRadius:100,backgroundColor:this.theme.brandPrimary}}></View>
                        ) : null}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.props.navigation.navigate('messages',  {player : this.player})} transparent style={{position:'relative', top:12}}>
                        <Icon name='envelope' type="SimpleLineIcons" style={{color:'#fff',fontSize:20}} />
                        {this.state.countMessages > 0 ? (
                            <View style={{position:'absolute', top:-5, right:0,width:10,height:10,borderRadius:100,backgroundColor:this.theme.brandPrimary}}></View>
                        ) : null}
                    </TouchableOpacity>
                </View>) : null}
            </Header>
            <Tabs
                locked={(Platform.OS === 'ios') ? false : true}
                renderTabBar={()=> <ScrollableTab style={{borderBottomWidth:0,borderTopWidth:0,borderColor:light.headerBorderTopColor}} />}
                style={{
                paddingTop: 0,
                zIndex:99,
                    backgroundColor:this.theme.contentVariationBg,
                borderBottomWidth:0,borderTopWidth:0,borderColor:this.theme.headerBorderTopColor,
                elevation: 0,shadowOffset: {height: 0, width: 0},
                shadowOpacity: 0,flex:1,borderWidth:0}} tabBarUnderlineStyle={{height:3,bottom:0}}>
                <Tab  heading={lang.getString('home').toUpperCase()}>
                    <Content style={{backgroundColor:this.theme.contentVariationBg}}>
                        {ADMOB_ID !== '' ? (<View style={{padding:10}}>
                            <AdMobBanner
                                adSize="fullBanner"
                                adUnitID={ADMOB_ID}
                                testDevices={[AdMobBanner.simulatorId]}
                                onAdFailedToLoad={error => console.error(error)}
                            />
                        </View>) : null}
                        <View style={{backgroundColor:this.theme.contentVariationBg}}>
                            <View style={{borderBottomWidth:10,borderBottomColor:this.theme.borderLineColor}}>
                                <Text style={{fontSize:13,color:this.theme.greyColor,marginLeft:10,marginTop:10}}>{lang.getString('featured')}</Text>
                                <Text style={{fontSize:17,fontWeight:'500',margin:10,color:this.theme.brandPrimary,marginBottom:0}}>{lang.getString("made-for-you")}</Text>
                                <DisplayComponent player={this.player} navigation={this.props.navigation} limit={4} type="global-spotlight" typeId="" displayType="horizontal-grid"/>
                            </View>
                        </View>

                        <View style={{backgroundColor:this.theme.contentVariationBg}}>
                            <View style={{borderBottomWidth:10,borderBottomColor:this.theme.borderLineColor}}>
                                <Text style={{fontSize:17,fontWeight:'500',margin:10,color:this.theme.brandPrimary}}>{lang.getString("charts-new-hot")}</Text>
                                <DisplayComponent player={this.player}  navigation={this.props.navigation} limit={10} type="charts-new-hot" typeId="all/this-week" displayType="lists"/>
                            </View>
                        </View>


                    </Content>
                </Tab>
                <Tab heading={lang.getString('stream').toUpperCase()}>
                    <Content style={{backgroundColor:this.theme.contentVariationBg}}>{this.props.userid === null || this.props.userid === '' ? (<PleaseLoginComponent navigation={this.props.navigation}/>) : (
                        <DisplayComponent
                            type="feed"
                            navigation={this.props.navigation}
                            typeId=""
                            displayType="feed-list"/>
                    )}</Content>

                </Tab>
                <Tab  heading={lang.getString('top-charts').toUpperCase()}>
                    <Content style={{backgroundColor:this.theme.contentVariationBg}}>
                        {ADMOB_ID !== '' ? (<View style={{padding:10}}>
                            <AdMobBanner
                                adSize="fullBanner"
                                adUnitID={ADMOB_ID}
                                testDevices={[AdMobBanner.simulatorId]}
                                onAdFailedToLoad={error => console.error(error)}
                            />
                        </View>) : null}
                        <View style={{backgroundColor:this.theme.contentVariationBg}}>
                            <View >
                                <DisplayComponent player={this.player}  navigation={this.props.navigation} limit={10} type="charts-top" typeId="all/this-week" displayType="lists"/>
                            </View>
                        </View>


                    </Content>
                </Tab>
                <Tab  heading={lang.getString('new-releases').toUpperCase()}>
                    <Content style={{backgroundColor:this.theme.contentVariationBg}}>
                        {ADMOB_ID !== '' ? (<View style={{padding:10}}>
                            <AdMobBanner
                                adSize="fullBanner"
                                adUnitID={ADMOB_ID}
                                testDevices={[AdMobBanner.simulatorId]}
                                onAdFailedToLoad={error => console.error(error)}
                            />
                        </View>) : null}
                        <View style={{backgroundColor:this.theme.contentVariationBg}}>
                            <View>
                                <DisplayComponent player={this.player}  navigation={this.props.navigation} limit={10} type="latest" typeId="" displayType="vertical-grid"/>
                            </View>
                        </View>

                    </Content>
                </Tab>
            </Tabs>
        </Container>)
    }


    displayGenres() {
        if (this.state.genres.length > 0) {
            let result = this.state.genres;
            let content = [];
            for (let i = 0; i < result.length;i++) {
                let genre = result[i];
                content.push(<View style={{backgroundColor:this.theme.contentVariationBg}}>
                    <View style={{borderBottomWidth:10,borderBottomColor:'#F8F8F8'}}>
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
})(FeedScreen)