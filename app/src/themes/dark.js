import { Platform, Dimensions, PixelRatio } from "react-native";
import platform from "../../native-base-theme/variables/platform";
import light from "./light";

export default dark = {
    ...light,
    //Container
    containerBgColor: "#141821",

    accentColor : '#141821',
    contentVariationBg : '#141821',
    headerBorderTopColor :'#E2E2E2',
    contentBg : '#FFF',
    contentVariationBorderColor : '#212835',
    blackColor : '#fff',
    borderLineColor: '#212835',
    footerDefaultBg: platform === "ios" ? "#212835" : "#212835",
    greyHeaderBg: '#141821',
    whiteColor: '#fff',
    lightGreyColor: '#212835'

}
