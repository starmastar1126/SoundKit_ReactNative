
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Root,StyleProvider} from 'native-base';
import {createStackNavigator,createAppContainer} from 'react-navigation';

import {Platform,View,KeyboardAvoidingView,Text,Animated,Easing} from 'react-native';
import storage from "./src/store/storage";
import store from "./src/store";
import routes from "./src/routes";
import { MenuProvider } from 'react-native-popup-menu';
import SplashScreen from 'react-native-splash-screen'
import StatusBarBackground from "./src/utils/statusbar";
import lang from "./src/utils/lang";
import {trackSchema} from "./src/store/realmSchema";
import {DEFAULT_LANG, DEFAULT_THEME} from "./src/config";
import Api from "./src/api";
import { useScreens } from 'react-native-screens';




console.disableYellowBox = true;
type Props = {};
const Realm = require('realm');

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            loaded : false,
            userid : false,
            didGetstarted: '0',
            changetheme: '0',
        };

        //this.preLoad(false);
        Api.get("setup").then((response) => {
            storage.set('setup_data', JSON.stringify(response));
            this.preLoad(response);
        }).catch((e) => {
            this.preLoad(false);
        })

        //delete all tracks without file path , means they are not downloaded completely
        Realm.open({schema: [trackSchema]})
            .then(realm => {
               try {
                   let tracks = realm.objects('track_downloads').filtered('file=""');
                   realm.delete(tracks);
               } catch (e) {

               }
               realm.close();
            })
    }

    preLoad(data) {
        storage.preLoad((error, result)  => {
            let userid = result[0][1];
            let password = result[1][1];
            let username = result[2][1];
            let didGetstarted = result[3][1];
            let avatar = result[4][1];
            let cover = result[5][1];
            let key = result[6][1];
            let setupData  = (result[10][1] && !data) ? JSON.parse(result[10][1]) : data;
            if (!setupData) setupData = {
                primary_color: '',
                accent_color: '',
                premium_account: true,
                enable_store: true,
                enable_blogs: true,
                enable_radios: true,
                enable_video: true,
                slide_image_1: '',
                slide_image_2: '',
                slide_image_3: '',
                privacy_link: '',
                terms_link: '',
                contact_link: '',
                default_mode: 'dark',
                in_app_purchase: false,
                default_language: 'en',
                transparent_primary: 'rgba(250,0,82,0.2)'
            };
            let language = (result[7][1] === null) ? setupData.default_language : result[7][1];
            let theme = (result[8][1]) ? result[8][1] : setupData.default_mode;
            let changetheme = (result[9][1]) ? result[9][1] : '0';


            if (userid != null) {

            }
            store.dispatch({type: 'AUTH_DETAILS', payload : {
                    userid : userid,
                    username : username,
                    password : password,
                    avatar : avatar,
                    cover : cover,
                    didGetstarted : didGetstarted,
                    apikey : key,
                    language : language,
                    theme : theme,
                    setup: setupData
                }});
            if (language !== null) {
                //console.log('current - ' + language);
                lang.setLanguage(language);
            }
            this.updateState({
                loaded : true,
                userid : userid,
                didGetstarted : didGetstarted,
                changetheme : changetheme
            });
            if ( changetheme === '1') storage.set('changetheme', '0');
        });
    }

    updateState(va) {
        this.setState(va);
    }
  render() {
      if (this.state.loaded) {
          const transitionConfig = () => {
              return {
                  transitionSpec: {
                      duration: 750,
                      easing: Easing.out(Easing.poly(4)),
                      timing: Animated.timing,
                      useNativeDriver: true,
                  },
                  screenInterpolator: sceneProps => {
                      const { layout, position, scene , index, scenes} = sceneProps;

                      const thisSceneIndex = scene.index;
                      const width = layout.initWidth;
                      const height = layout.initHeight
                      const translateY = position.interpolate({
                          inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
                          outputRange: [height, 0, 0]
                      });
                      const translateX = position.interpolate({
                          inputRange: [thisSceneIndex - 1, thisSceneIndex, thisSceneIndex + 1],
                          outputRange: [width, 0, 0]
                      })
                      //console.log(scene.route.routeName + ' walo');
                      return (scene.route.routeName === 'player') ? { transform: [ { translateY } ] } : { transform: [ { translateX } ] }
                  },
              }
          };
          useScreens();
          let param = {
              initialRouteName: 'feed',
              headerMode: 'none',
              transitionConfig,
          };

          if (!this.state.userid) {
              param.initialRouteName = 'start';
          } else {
              if (this.state.didGetstarted === '0' || this.state.didGetstarted === null) param.initialRouteName = "welcome";
          }
          if (this.state.changetheme === '1') {
              param.initialRouteName = "account";
          }

          const stackNav = createStackNavigator(routes, param);
          const AppContainer = createAppContainer(stackNav);
          return (
              <Root >
                  {Platform.OS === 'ios' ? (
                      <KeyboardAvoidingView style={{flex: 1,overflow: 'hidden'}}  behavior="padding" enabled>
                              <MenuProvider>
                                  <Provider store={store} >
                                      <View style={{flex: 1}}>
                                          <StatusBarBackground/>
                                          <View style={{flex: 1,overflow: 'hidden',position:'absolute', top:0,height:'100%',width:'100%'}}>
                                              <AppContainer/>
                                          </View>
                                      </View>
                                  </Provider>
                              </MenuProvider>
                      </KeyboardAvoidingView>
                  ) : (<View style={{flex:1}}>
                          <MenuProvider>
                              <Provider store={store} >
                                  <View style={{flex: 1}}>
                                      <StatusBarBackground/>
                                      <View style={{flex: 1,overflow: 'hidden'}}>
                                          <AppContainer/>
                                      </View>
                                  </View>
                              </Provider>
                          </MenuProvider>
                  </View>)}
              </Root>
          );
      }
      return null;
  }

    componentDidMount() {
        SplashScreen.hide();
    }
}
