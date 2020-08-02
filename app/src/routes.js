import HomeScreen from "./screens/HomeScreen";
import AuthScreen from "./screens/AuthScreen";
import ExploreScreen from "./screens/ExploreScreen";
import FeedScreen from "./screens/FeedScreen";
import AccountScreen from "./screens/AccountScreen";
import CollectionScreen from "./screens/CollectionScreen";
import ProScreen from "./screens/ProScreen";
import SettingsScreen from "./screens/SettingsScreen";
import StoreScreen from "./screens/StoreScreen";
import UserProfileScreen from "./screens/UserProfileScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import PlayerScreen from "./screens/PlayerScreen";
import VideoScreen from "./screens/VideoScreen";
import VideoPlayerComponent from "./components/VideoPlayerComponent";
import AlbumProfileScreen from "./screens/AlbumProfileScreen";
import NotificationScreen from "./screens/NotificationScreen";
import MessagesScreen from "./screens/MessagesScreen";
import ChatScreen from "./screens/ChatScreen";
import PricingScreen from "./screens/PricingScreen";
import RadioScreen from "./screens/RadioScreen";
import BlogScreen from "./screens/BlogScreen"

export default routes = {
    start : HomeScreen,
    auth : AuthScreen,
    explore : ExploreScreen,
    feed : FeedScreen,
    account : AccountScreen,
    collection : CollectionScreen,
    pro : ProScreen,
    settings : SettingsScreen,
    store : StoreScreen,
    userprofile : UserProfileScreen,
    welcome : WelcomeScreen,
    player : PlayerScreen,
    video : VideoScreen,
    videoPlayer : VideoPlayerComponent,
    albumProfile : AlbumProfileScreen,
    notifications : NotificationScreen,
    messages : MessagesScreen,
    chat : ChatScreen,
    pricing : PricingScreen,
    radios: RadioScreen,
    blogs: BlogScreen,
}
