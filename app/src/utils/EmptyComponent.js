import React,{Component} from 'react';
import {View,Text} from 'react-native';
import {
    Icon
} from 'native-base';
import light from "../themes/light";

export default class EmptyComponent extends Component {
    render() {
        return (
            <View style={{flex:1, flexDirection: 'column', justifyContent: 'center',alignContent: 'center',
                paddingTop:this.props.paddingTop !== undefined ? this.props.paddingTop : 150 }}>
                <Icon  name={this.props.icon !== undefined ? this.props.icon : 'fire'}
                       type={this.props.iconType !== undefined ? this.props.iconType : 'SimpleLineIcons'}
                       style={{alignSelf:'center',fontSize:40,color: light.brandPrimary,marginBottom: 15}}/>
                <Text style={{alignSelf:'center',fontSize:15,color:'grey',fontWeight:'bold'}}>{this.props.text}</Text>
            </View>
        )
    }
}