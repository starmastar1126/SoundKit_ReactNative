import React, {Component} from 'react';
import BaseScreen from "../utils/BaseScreen";
import {Platform,View,Image,TouchableOpacity,ScrollView,ActivityIndicator,FlatList} from 'react-native';
import {Icon,Button,Card, CardItem, Text, Input,Container,Item,Content} from 'native-base';
import lang from "../utils/lang";
import {connect} from "react-redux";
import EmptyComponent from '../utils/EmptyComponent'
import Api from "../api";
import FastImage from 'react-native-fast-image'
import Spinner from 'react-native-loading-spinner-overlay';
import Time from '../utils/Time'
import Util from '../utils/Util'
import Toast from 'react-native-toast-native';

class CommentComponent extends BaseScreen {
    offset = 0;
    limit = 10;
    trackId = null;
    component = null;
    type = '';
    typeId = '';
    replyType = 'comment';
    commentId = '';
    replyOffset = 0;
    replyLimit = 10;
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            viewType : 1,
            replyFetching : false,
            replyRefreshing : false,
            replyItemDetails : null,
            replyItemLists : [],
            replyItemListNotEnd : false,
            replyFetchFinished : false,
            commentText : '',
            replyText: '',
            loading : false
        };
        this.limit = (this.props.limit !== undefined) ? this.props.limit : 10;
        this.component = this.props.component;
        this.trackId = this.props.trackId;
        this.type = this.props.type;
        this.typeId = this.props.trackId;
        this.item  = this.props.track;
        this.loadComments(false);
    }

    loadComments(paginate) {
        this.updateState({fetchFinished : false});
        let offset = this.offset;
        this.offset = this.limit + this.offset;
        Api.get("load/comments", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.type,
            type_id : this.typeId,
            offset : offset,
            limit : this.limit
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.itemLists);
                lists.push(...result);
            } else {
                lists.push(...result);
            }
            this.updateState({itemLists: lists,fetchFinished: true, itemListNotEnd : (result.length > 0) ? false : true});
        }).catch(() => {
            this.updateState({fetchFinished: true,itemListNotEnd: true});
        })
    }

    handlerCommentsRefresh() {
        this.offset = 0;
        this.loadComments();
    }

    delete(item,index,reply) {
        if (reply) {
            let lists = Util.removeIndexFromArray(index, this.state.replyItemLists);
            this.updateState({replyItemLists : lists});
        } else {
            let lists = Util.removeIndexFromArray(index, this.state.itemLists);
            this.updateState({itemLists : lists});
        }
        Api.get("remove/comment" ,{
            userid : this.props.userid,
            key : this.props.apikey,
            id : item.id
        });
    }

    displayComment(item,index, reply) {
        return (<View style={{flex:1,flexDirection:'row',padding:10}}>
            <FastImage source={{uri: item.user.avatar}} style={{width:40,height:40,borderRadius:100,marginTop:2}}/>
            <View style={{flex:1,flexDirection:'column',marginLeft: 7}}>
                <Text style={{color:this.theme.blackColor}}><Text style={{color:this.theme.blackColor,fontWeight:'bold'}}>{item.user.full_name}</Text> {item.message}</Text>
                <View style={{flexDirection:'row', flex:1, marginTop: 5}}>
                    {!reply ? (<View style={{flexDirection:'row'}}>
                        {item.replies > 0 ? (<TouchableOpacity onPress={() => {this.openReplies(item.id)}} style={{marginRight:10}}>
                            <Text style={{color:this.theme.greyColor}}><Text style={{color:this.theme.greyColor,fontWeight:'bold'}}>{item.replies.toString()}</Text> {lang.getString('replies')}</Text>
                        </TouchableOpacity>) : null}

                        <TouchableOpacity onPress={() => {this.openReplies(item.id)}} style={{marginLeft: 0}}>
                            <Text style={{color:this.theme.greyColor}}>{lang.getString('reply')}</Text>
                        </TouchableOpacity>
                    </View>) : null}

                    {item.isOwner === 1 ? (
                        <TouchableOpacity onPress={() => {this.delete(item,index,reply)}} style={{marginLeft: 10}}>
                            <Text style={{color:this.theme.greyColor}}>{lang.getString('delete')}</Text>
                        </TouchableOpacity>
                    ) : null}

                    <Text note style={{marginLeft: 5}}>{Time.ago(item.time)}</Text>
                </View>
            </View>
        </View>)
    }

    handlerReplyRefresh() {
        this.replyOffset = 0;
        this.loadReplies();
    }

    loadReplies(paginate) {
        this.updateState({replyFetchFinished : false});
        let offset = this.replyOffset;
        this.replyOffset = this.replyLimit + this.replyOffset;

        Api.get("load/comments", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.replyType,
            type_id : this.commentId,
            offset : offset,
            limit : this.replyLimit
        }).then((result) => {
            let lists = [];
            if (paginate) {
                //more
                lists.push(...this.state.replyItemLists);
                lists.push(...result);
            } else {
                lists.push(...result);
            }
            this.updateState({replyItemLists: lists,replyFetchFinished: true, replyItemListNotEnd : (result.length > 0) ? false : true});
        }).catch(() => {
            this.updateState({replyFetchFinished: true,replyItemListNotEnd: true});
        })
    }

    submitReply() {
        if (this.state.replyText === '') {
            Toast.show(lang.getString('please-enter-comment'), Toast.LONG, this.theme.toast.brand);
            return;
        }

        this.updateState({loading : true});
        Api.get("add/comment", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.replyType,
            type_id : this.commentId,
            message : this.state.replyText
        }).then((result) => {
            let lists = [];
            lists.push(result);
            lists.push(...this.state.replyItemLists);
            this.updateState({replyItemLists: lists,replyFetchFinished: true, loading : false,replyText: ''});
        })
    }

    submitComment() {
        if (this.state.commentText === '') {
            Toast.show(lang.getString('please-enter-comment'),Toast.LONG,Toast.BOTTOM,this.theme.toast.brand);
            return;
        }

        this.updateState({loading : true});
        Api.get("add/comment", {
            userid : this.props.userid,
            key : this.props.apikey,
            type : this.type,
            type_id : this.typeId,
            message : this.state.commentText
        }).then((result) => {
            let lists = [];
            lists.push(result);
            lists.push(...this.state.itemLists);

            this.updateState({itemLists: lists,fetchFinished: true, loading : false,commentText: ''});
        })
    }

    closeReplies() {
        this.commentId = '';
        this.replyOffset = 0;
        this.updateState({
            replyFetching : false,
            replyRefreshing : false,
            replyItemLists : [],
            replyItemListNotEnd : false,
            replyFetchFinished : false,
            viewType: 1
        })
    }

    openReplies(id) {
        this.commentId = id;
        this.replyOffset = 0;
        this.updateState({
            viewType : 2
        });
        this.loadReplies(false);
    }

    render() {
        return this.showContent(<Container style={{backgroundColor: this.theme.contentVariationBg}}>
            <Spinner visible={this.state.loading} textContent={""} textStyle={{color: '#FFF'}} />
            {this.state.viewType === 1 ? (<View style={{flexDirection: 'column',flex:1}}>
                <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                    <TouchableOpacity onPress={() => {
                        this.component.updateState({commentModalVisible : false})
                    }}>
                        <Icon name="close" style={{color:this.theme.blackColor, fontSize: 30}}/>
                    </TouchableOpacity>
                    <Text style={{color:this.theme.blackColor, fontSize: 20, marginLeft:10}}>{lang.getString('comments')}</Text>
                </View>
                <View style={{flex: 1}}>
                    <FlatList
                        style={{flex:1}}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //console.log(d.distanceFromEnd )
                            if (this.state.itemLists.length > 0 && !this.state.itemListNotEnd && this.state.fetchFinished) {
                                this.loadComments(true);
                            }
                            return true;
                        }}
                        ref='_flatList'
                        data={this.state.itemLists}
                        extraData={this.state}
                        refreshing={this.state.refreshing}
                        onRefresh={() => {
                            this.handlerCommentsRefresh();
                        }}
                        keyExtractor={(item, index) => item.id}
                        ListEmptyComponent={!this.state.fetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent paddingTop={70} icon="cup" text={lang.getString('no_comments_found')}/>)}
                        ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                            {(!this.state.fetchFinished) ? (
                                <ActivityIndicator size='large' />
                            ) : null}

                        </View>}
                        renderItem={({ item ,index}) => (this.displayComment(item,index, false))}
                    />

                </View>
                <View style={{height: 60, borderTopColor: this.theme.greyHeaderBg, borderTopWidth:1, padding:10, flexDirection: 'row'}}>

                    {this.isLoggedIn() ? (<View style={{flex:1,flexDirection: 'row'}}><FastImage source={{uri: this.props.avatar}} style={{width:40,height:40,borderRadius:100}}/>
                        <Item rounded style={{flex: 1,marginLeft: 5}}>
                            <Input style={{color: this.theme.blackColor}} value={this.state.commentText} placeholder={lang.getString('enter-comment')} onChangeText={(t) => this.updateState({commentText : t})}/>
                        </Item>
                        <Button onPress={() => {this.submitComment()}} rounded success style={{backgroundColor:this.theme.brandPrimary,marginLeft: 5}}>
                            <Icon name="paper-plane" style={{fontSize: 18}} type="SimpleLineIcons"/>
                        </Button></View>) : (<View style={{alignContent:'center',flex:1}}>
                        <TouchableOpacity onPress={() => {this.gotoLogin()}}>
                            <Text style={{color: this.theme.brandPrimary, alignSelf:'center'}}>{lang.getString('login-or-register-comment')}</Text>
                        </TouchableOpacity>
                    </View>)}
                </View>
            </View>) : (<View style={{flexDirection: 'column',flex:1}}>
                <View style={{width:'100%',height:48, backgroundColor: this.theme.greyHeaderBg, padding:10, flexDirection:'row'}}>
                    <TouchableOpacity onPress={() => {
                        this.closeReplies()
                    }}>
                        <Icon name="close" style={{color:this.theme.blackColor, fontSize: 30}}/>
                    </TouchableOpacity>
                    <Text style={{color:this.theme.blackColor, fontSize: 20, marginLeft:10}}>{lang.getString('replies')}</Text>
                </View>
                <View style={{flex: 1}}>
                    <FlatList
                        style={{flex:1}}
                        onEndReachedThreshold={.5}
                        onEndReached={(d) => {
                            //console.log(d.distanceFromEnd )
                            if (this.state.replyItemLists.length > 0 && !this.state.replyItemListNotEnd && this.state.replyFetchFinished) {
                                this.loadReplies(true);
                            }
                            return true;
                        }}
                        ref='_flatList'
                        data={this.state.replyItemLists}
                        extraData={this.state}
                        refreshing={this.state.replyRefreshing}
                        onRefresh={() => {
                            this.handlerReplyRefresh();
                        }}
                        keyExtractor={(item, index) => item.id}
                        ListEmptyComponent={!this.state.replyFetchFinished ? (
                            <Text/>
                        ) : (<EmptyComponent paddingTop={70} icon="cup" text={lang.getString('no_replies_found')}/>)}
                        ListFooterComponent={<View style={{ paddingVertical: 20 }}>
                            {(!this.state.replyFetchFinished) ? (
                                <ActivityIndicator size='large' />
                            ) : null}

                        </View>}
                        renderItem={({ item ,index}) => (this.displayComment(item,index,true))}
                    />

                </View>
                <View style={{height: 60, borderTopColor: this.theme.greyHeaderBg, borderTopWidth:1, padding:10, flexDirection: 'row'}}>
                    {this.isLoggedIn() ? (<View style={{flex:1,flexDirection: 'row'}}>
                        <FastImage source={{uri: this.props.avatar}} style={{width:40,height:40,borderRadius:100}}/>
                        <Item rounded style={{flex: 1,marginLeft: 5,borderColor:this.theme.borderLineColor,backgroundColor:this.theme.contentVariationBg}}>
                            <Input style={{color: this.theme.blackColor}} value={this.state.replyText} placeholder={lang.getString('reply')} onChangeText={(t) => this.updateState({replyText : t})}/>
                        </Item>
                        <Button onPress={() => {this.submitReply()}} rounded success style={{backgroundColor:this.theme.brandPrimary,marginLeft: 5}}>
                            <Icon name="paper-plane" style={{fontSize: 18}} type="SimpleLineIcons"/>
                        </Button>
                    </View>) : (<View style={{alignContent:'center',flex:1}}>
                        <TouchableOpacity onPress={() => {this.gotoLogin()}}>
                            <Text style={{color: this.theme.brandPrimary, alignSelf:'center'}}>{lang.getString('login-or-register-comment')}</Text>
                        </TouchableOpacity>
                    </View>)}
                </View>
            </View>)}
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
})(CommentComponent)