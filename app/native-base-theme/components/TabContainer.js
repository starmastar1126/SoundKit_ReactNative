// @flow

import variable from "./../variables/platform";
import { Platform } from "react-native";

export default (variables /*: * */ = variable) => {
  const platformStyle = variables.platformStyle;
  const platform = variables.platform;

  const tabContainerTheme = {
    elevation: 0,
    height: 50,
    flexDirection: "row",
    shadowColor: platformStyle === "material" ? "#000" : undefined,
    shadowOffset: platformStyle === "material"
      ? { width: 0, height:0 }
      : undefined,
    shadowOpacity: platformStyle === "material" ? 0: undefined,
    shadowRadius: platformStyle === "material" ? 0 : undefined,
    justifyContent: "space-around",
    borderBottomWidth: Platform.OS === "ios" ? variables.borderWidth : 0,
    borderColor: variables.topTabBarBorderColor
  };

  return tabContainerTheme;
};
