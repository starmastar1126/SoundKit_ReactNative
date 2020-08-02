import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform, View, Text, Image, TouchableOpacity, ScrollView, Share, Linking, StyleSheet,ActivityIndicator,WebView} from 'react-native';
import {Container,Icon,Button,Header,Content, List, ListItem, Left, Body,Right,Badge,Segment,Toast} from 'native-base';
import lang from "../utils/lang";
import FastImage from 'react-native-fast-image'
import {connect} from "react-redux";
import light from "../themes/light";
import storage from "../store/storage";
import {NavigationActions,StateUtils,StackActions} from 'react-navigation'
import ToggleSwitch from 'toggle-switch-react-native'
import {
    APP_LINK,
    BASE_CURRENCY,
    CONTACT_LINK,
    ENABLE_PREMIUM, MONTHLYPRODUCT_ID,
    PRIVACY_LINK,
    TERMS_LINK,
    YEARLYPRODUCT_ID
} from "../config";
import dark from "../themes/dark";
import Api from "../api";
import { NativeModules } from 'react-native'
const { InAppUtils } = NativeModules;

class AccountScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.activeMenu = "menu";
        this.state = {
            ...this.state,
            details : null,
            page : 'yearly'
        }

        this.component = this.props.navigation.getParam('component');

        this.loadDetails();
    }

    loadDetails() {
        Api.get('price/detail', {
            userid : this.props.userid,
            key : this.props.apikey,
        }).then((r) => {
            this.updateState({details: r});
        })
    }


    successPayment() {
        super.successPayment();
        this.component.loadDetails();
        this.props.navigation.goBack();
    }




    render() {
        return this.show(<Container style={{flex: 1,backgroundColor:this.theme.contentVariationBg}}>
            <Header hasTabs noShadow style={{paddingTop:(Platform.OS === 'ios') ? 18 : 0,backgroundColor: this.theme.headerBg,height:(Platform.OS === 'ios') ? 15 : 0}}>
            </Header>
            <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                <TouchableOpacity onPress={() => {
                    this.props.navigation.goBack();
                }}>
                    <Icon name="arrow-round-back"  style={{color:this.theme.blackColor, fontSize: 30}}/>
                </TouchableOpacity>
                <Text style={{color:this.theme.blackColor, fontSize: 17, marginLeft:10,marginTop:3}}>{lang.getString('pricing')}</Text>
            </View>
            {this.state.details === null ?( <View style={{
                ...StyleSheet.absoluteFillObject,
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <ActivityIndicator />
            </View>) : (<Content>
                <Segment>
                    <Button onPress={() => this.updateState({page : 'yearly'})} first active={(this.state.page === 'yearly')}><Text style={{marginLeft:20,marginRight:20}}>{lang.getString('yearly')}</Text></Button>
                    <Button onPress={() => this.updateState({page : 'monthly'})} last active={(this.state.page === 'monthly')}><Text style={{marginLeft:20,marginRight:20}}>{lang.getString('monthly')}</Text></Button>
                </Segment>

                <View style={{borderRadius:20,backgroundColor: '#F2F2F2', margin:20,padding: 20}}>
                    {this.state.page === 'yearly' ? (<View style={{alignContent:'center', flex: 1,flexDirection:'column'}}>
                        <Text style={{fontSize: 40,color:this.theme.brandPrimary, marginBottom: 30,alignSelf:'center'}}>{BASE_CURRENCY}{this.state.details.yearly}</Text>

                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('listen-to-allmusic')}</Text>

                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('download-allmusic')}</Text>

                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('listen-to-music-offline')}</Text>

                        <Button onPress={() => {
                            if (Platform.OS === 'ios' && this.props.setup.in_app_purchase) {
                                InAppUtils.canMakePayments((canMakePayments) => {
                                    if(!canMakePayments) {
                                        Toast.show({
                                            text : lang.getString('cant_make_payment_on_this_device'),
                                            type : 'danger'
                                        });
                                    } else {
                                        InAppUtils.purchaseProduct(YEARLYPRODUCT_ID, (error, response) => {
                                            // NOTE for v3.0: User can cancel the payment which will be available as error object here.
                                            if(response && response.productIdentifier) {
                                                //send to server to activate your
                                                this.activateUser('yearly', this.state.details.yearly)
                                            }
                                        });
                                    }
                                })
                                return false;
                            }
                            this.showPaymentModal('pro-users', 'yearly', this.state.details.yearly)
                        }} rounded success style={{alignSelf:'center'}}>
                            <Text style={{color:'#fff',marginLeft: 20, marginRight: 20}}>{lang.getString('pay-now')}</Text>
                        </Button>
                    </View>) : (<View>
                        <Text style={{fontSize: 40,color:this.theme.brandPrimary, marginBottom: 30,alignSelf:'center'}}>{BASE_CURRENCY}{this.state.details.monthly}</Text>
                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('listen-to-allmusic')}</Text>

                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('download-allmusic')}</Text>

                        <Text style={{fontSize: 15,marginBottom: 25,alignSelf:'center'}}>{lang.getString('listen-to-music-offline')}</Text>

                        <Button onPress={() => {
                            if (Platform.OS === 'ios' && this.props.setup.in_app_purchase) {
                                InAppUtils.canMakePayments((canMakePayments) => {
                                    if(!canMakePayments) {
                                        Toast.show({
                                            text : lang.getString('cant_make_payment_on_this_device'),
                                            type : 'danger'
                                        });
                                    } else {
                                        InAppUtils.purchaseProduct(MONTHLYPRODUCT_ID, (error, response) => {
                                            // NOTE for v3.0: User can cancel the payment which will be available as error object here.
                                            if(response && response.productIdentifier) {
                                                //send to server to activate your
                                                this.activateUser('yearly', this.state.details.monthly)
                                            }
                                        });
                                    }
                                })
                                return false;
                            }

                            this.showPaymentModal('pro-users', 'monthly', this.state.details.monthly)
                        }} rounded success style={{alignSelf:'center'}}>
                            <Text style={{color:'#fff',marginLeft: 20, marginRight: 20}}>{lang.getString('pay-now')}</Text>
                        </Button>
                    </View>)}
                </View>
            </Content>)}
        </Container>)
    }

    activateUser(type, price) {
        Api.get("activate/pro", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : type,
            price : price,
        }).then((r) => {
            Toast.show({
                text : lang.getString('payment_made_success'),
                type : 'success'
            });
        }).catch((r) => {
            Toast.show({
                text : lang.getString('payment_failed'),
                type : 'danger'
            });

        })
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
})(AccountScreen)