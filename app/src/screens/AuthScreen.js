import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Text,Image,TouchableOpacity,ScrollView} from 'react-native';
import {Container,Icon,Button,Form, Item, Input, Label,Toast} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import Spinner from 'react-native-loading-spinner-overlay';
import Api from "../api";
import storage from "../store/storage";
import {FBLogin, FBLoginManager} from 'react-native-facebook-login';
import store from "../store";
import FastImage from 'react-native-fast-image'
import {ENABLE_FB_LOGIN} from "../config";


class AuthScreen extends BaseScreen {

    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            currentPage : (this.props.navigation.getParam('page', 'login')),
            loading : false,
            position : 0,
            image : (this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png"),
            username : '',
            password : '',
            email : '',
            name : ''
        }

        setInterval(() => {
            let dPosition = 0;
            let dImage = (this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png");
            if (this.state.position === 0) {
                dPosition = 1;
                dImage = (this.props.setup.slide_image_2) ? this.props.setup.slide_image_2 : require("../images/topo2.png");
            } else if(this.state.position === 1) {
                dPosition = 2;
                dImage = (this.props.setup.slide_image_3) ? this.props.setup.slide_image_3 : require("../images/topo3.png");
            } else if(this.state.position === 2) {
                dPosition = 0;
                dImage = (this.props.setup.slide_image_1) ? this.props.setup.slide_image_1 : require("../images/topo1.png");
            }
            this.updateState({
                image : dImage,
                position : dPosition
            });
        }, 3000)
    }

    submitLogin() {
        if (this.state.username === '') {
            Toast.show({
                text : lang.getString("enter-your-username"),
                type : 'danger'
            });
            return false;
        }
        if (this.state.password === '') {
            Toast.show({
                text : lang.getString("enter-your-password"),
                type : 'danger'
            });
            return false;
        }
        this.updateState({loading: true});
        Api.get('login', {
            username : encodeURI(this.state.username),
            password : encodeURI(this.state.password),
            device : encodeURI(this.device)
        }).then((result) => {
            this.updateState({loading: false});
            if (result.status === 1) {
                //success signup and logged in
                storage.set('user_name', result.full_name);
                storage.set('avatar', result.avatar);
                storage.set('cover', result.cover);
                storage.set('userid', result.id);
                storage.set('api_key', result.key);
                storage.set('did_getstarted', '1');
                this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                        userid : result.id,
                        username : result.full_name,
                        password : result.password,
                        avatar : result.avatar,
                        cover : result.cover,
                        apikey : result.key,
                        language: this.props.language,
                        theme : this.props.theme,
                        setup: this.props.setup
                    }});
                this.props.navigation.navigate("feed");

            } else {
                Toast.show({
                    text : lang.getString("invalid-login-details"),
                    type : 'danger'
                })
            }
        }).catch(() => this.updateState({loading: false}))

    }

    submitSignup() {
        if (this.state.username === '') {
            Toast.show({
                text : lang.getString("provide-your-username"),
                type : 'danger'
            });
            return false;
        }

        if (this.state.email === '') {
            Toast.show({
                text : lang.getString("provide-your-email"),
                type : 'danger'
            });
            return false;
        }
        if (this.state.name === '') {
            Toast.show({
                text : lang.getString("provide-your-fullname"),
                type : 'danger'
            });
            return false;
        }
        if (this.state.password === '') {
            Toast.show({
                text : lang.getString("choose-your-password"),
                type : 'danger'
            });
            return false;
        }
        this.updateState({loading: true});

        Api.get("signup", {
            username : this.state.username,
            password : this.state.password,
            email : this.state.email,
            full_name : this.state.name,
            device : this.device
        }).then((result) => {
            this.updateState({loading: false});
            if (result.status === 1) {
                //success signup and logged in
                Toast.show({
                    text : lang.getString("register-successful"),
                    type : 'info'
                });

                storage.set('user_name', result.full_name);
                storage.set('avatar', result.avatar);
                storage.set('cover', result.cover);
                storage.set('userid', result.id);
                storage.set('api_key', result.key);

                this.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                        userid : result.id,
                        username : result.full_name,
                        password : result.password,
                        avatar : result.avatar,
                        cover : result.cover,
                        apikey : result.key,
                        language: this.props.language,
                        theme : this.props.theme,
                        setup: this.props.setup
                    }});

                this.props.navigation.navigate("welcome");

            } else if(result.status === 2) {
                //user need to activate account
                Toast.show({
                    text : lang.getString("please-confirm-email-register"),
                    type : 'info'
                });
                this.props.navigation.navigate("home")
            } else {
                //problem
                Toast.show({
                    text : result.message,
                    type : 'danger'
                })
            }
        }).catch(() => this.updateState({loading: false}));
    }

    render() {
        const resizeMode = "cover";
        return this.showContent(
            <Container style={{flex: 1}}>
                <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
                <View style={{flex: 1}}>
                    {(typeof this.state.image === 'string' && this.state.image.indexOf('http') !== -1) ? (<FastImage
                        style={{flex: 1, resizeMode,width: null, height:null}}
                        source={{
                                uri: this.state.image
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                        />) : (<Image style={{flex: 1, resizeMode,width: null, height:null}} source={this.state.image}/>)}

                    <View style={{position: 'absolute', top: 0, left: 0,right:0,bottom:0,backgroundColor : this.theme.primaryTransparent}}>
                        <ScrollView bounces={false} style={{flex: 1,flexDirection: 'column'}}>
                            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', padding: 30}}>
                                <TouchableOpacity onPress={() => this.props.navigation.goBack()} style={{position:'absolute', top: (Platform.OS === 'ios') ? 20 : 15 , left: 10}}>
                                    <Icon  name="arrow-round-back" style={{fontSize:45,color:'#FFF'}}/>
                                </TouchableOpacity>
                                {(this.state.currentPage === 'login') ? (
                                    <View>

                                        <Text style={{alignSelf:"center",fontSize:35,color:'white',marginTop:60,marginBottom:100}}>{lang.getString("login")}</Text>

                                        <Form>
                                            <Item rounded style={{marginBottom: 20,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='person' />
                                                <Input style={{color:'black'}} placeholder={lang.getString("username")} onChangeText={(t) => this.updateState({username : t})}/>
                                            </Item>
                                            <Item rounded  style={{marginBottom: 40,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='lock' />
                                                <Input secureTextEntry placeholder={lang.getString("password")} style={{color:'black'}} onChangeText={(t) => this.updateState({password : t})}/>
                                            </Item>
                                        </Form>

                                        <TouchableOpacity onPress={() => this.submitLogin()}>
                                            <Icon name="arrow-right-circle" type="SimpleLineIcons" style={{color:'white',fontSize: 50, alignSelf:"center"}}/>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                {(this.state.currentPage === 'signup') ? (
                                    <View>
                                        <Text style={{alignSelf:"center",fontSize:35,color:'white',marginTop:0,marginBottom:10}}>{lang.getString("signup")}</Text>

                                        <Form style={{marginTop:30}}>
                                            <Item rounded style={{marginBottom: 20,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='person' />
                                                <Input style={{color:'black'}} placeholder={lang.getString("fullname")} onChangeText={(t) => this.updateState({name : t})}/>
                                            </Item>
                                            <Item rounded style={{marginBottom: 20,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='person' />
                                                <Input style={{color:'black'}} placeholder={lang.getString("username")} onChangeText={(t) => this.updateState({username : t})}/>
                                            </Item>
                                            <Item rounded style={{marginBottom: 20,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='mail' />
                                                <Input style={{color:'black'}} placeholder={lang.getString("email-address")} onChangeText={(t) => this.updateState({email : t})}/>
                                            </Item>
                                            <Item rounded  style={{marginBottom: 40,backgroundColor:'#FFF',paddingLeft:7}}>
                                                <Icon active name='lock' />
                                                <Input secureTextEntry placeholder={lang.getString("password")} style={{color:'black'}} onChangeText={(t) => this.updateState({password : t})}/>
                                            </Item>

                                        </Form>

                                        <TouchableOpacity onPress={() => this.submitSignup()}>
                                            <Icon name="arrow-right-circle" type="SimpleLineIcons" style={{color:'white',fontSize: 50, alignSelf:"center"}}/>
                                        </TouchableOpacity>
                                    </View>
                                ) : null}

                                <View style={{width:'100%',flexDirection:'column', padding:20, marginTop:50}}>

                                    {ENABLE_FB_LOGIN ? ( <Button onPress={() => this.fbLogin()} block danger style={{width:'100%',backgroundColor:'#466594', marginBottom: 5}}>
                                        <Icon name='social-facebook'  type="SimpleLineIcons" style={{color:'white'}} /><Text style={{color:'white',fontSize: 20}}>{lang.getString("login-with-facebook")}</Text>
                                    </Button>) : null}
                                    {(this.state.currentPage === "login" || this.state.currentPage === 'forgot') ? (
                                        <Button onPress={() => this.updateState({currentPage: "signup"})} block danger style={{width:'100%',backgroundColor:this.theme.brandPrimary}}>
                                            <Text style={{color:'white',fontSize: 20}}>{lang.getString("signup-for-account")}</Text>
                                        </Button>
                                    ): (<Button onPress={() => this.updateState({currentPage: "login"})} block danger style={{width:'100%',backgroundColor:this.theme.brandPrimary}}>
                                        <Text style={{color:'white',fontSize: 20}}>{lang.getString("login")}</Text>
                                    </Button>)}
                                </View>
                            </View>


                        </ScrollView>


                    </View>
                </View>
            </Container>
        )
    }

    fbLogin() {
        FBLoginManager.setLoginBehavior(Platform.OS === 'ios' ? FBLoginManager.LoginBehaviors.Web : FBLoginManager.LoginBehaviors.WebView); // defaults to Native
        let component = this;
        FBLoginManager.loginWithPermissions(["email"], function(error, data){
            if (!error) {
                //console.log(data);
                var api = `https://graph.facebook.com/v2.3/${data.credentials.userId}/?fields=name,email&redirect=false&access_token=${data.credentials.token}`;

                fetch(api)
                    .then((response) => response.json())
                    .then((responseData) => {
                        //console.log('fbing')
                        component.updateState({loading: true});
                        let email = '';
                        try{
                            email = responseData.email;
                        } catch (e) {
                        }

                        Api.get('social/signup', {
                            device : component.device,
                            full_name : responseData.name,
                            email : email,
                            fbid : responseData.id,
                        }).then((result) => {
                            component.updateState({loading: false});
                            if (result.status === 1) {
                                storage.set('user_name', result.full_name);
                                storage.set('avatar', result.avatar);
                                storage.set('cover', result.cover);
                                storage.set('userid', result.id);
                                storage.set('api_key', result.key);
                                storage.set('did_getstarted', '1');

                                component.props.dispatch({type: 'SET_AUTH_DETAILS', payload : {
                                        userid : result.id,
                                        username : result.full_name,
                                        password : result.password,
                                        avatar : result.avatar,
                                        cover : result.cover,
                                        apikey : result.key,
                                        language: component.props.language,
                                        theme : component.props.theme,
                                        setup : component.props.setup
                                    }});

                                component.props.navigation.navigate("feed");
                            }
                        }).catch((e) => {
                            //console.log(e);
                            Toast.show({
                                text : 'Problem connecting - ' + e.message,
                                type : 'danger'
                            });
                            component.updateState({loading: false});
                        })
                    })
                    .done();
            } else {
                //console.log("Error: ", error);
            }
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
})(AuthScreen)