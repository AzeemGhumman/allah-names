// This is the first file which is reached and it sets all navigators
import React from "react";
import { Platform, View, Text } from "react-native";
import {
  createMaterialTopTabNavigator,
  createAppContainer
} from "react-navigation";

import {
  createStackNavigator
} from "react-navigation-stack"

import LearnScreen from "./screens/LearnScreen"; // learn screen
import HomeScreen from "./screens/HomeScreen"; // home screen
import GroupScreen from "./screens/GroupScreen"; // group screen
import QuizScreen from "./screens/QuizScreen"; // quiz screen
import InfoScreen from "./screens/InfoScreen"; // info screen

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        header: null
      }
    },
    Learn: {
      screen: LearnScreen,
      navigationOptions: {
        header: null
      }
    },
    Group: {
      screen: GroupScreen,
      navigationOptions: {
        header: null
      }
    },
    Quiz: {
      screen: QuizScreen,
      navigationOptions: {
        header: null
      }
    },
    Info: {
      screen: InfoScreen,
      navigationOptions: {
        header: null
      }
    },
  },
  { initialRouteName: Platform.OS === "ios" ? "Home" : "Home" }
); // if ios, first screen is Home else Splash

// main app container
const AppContainer = createAppContainer(AppNavigator);

class App extends React.Component {
  render() {
    // following removes bottom yellow banner showing warnings
    console.disableYellowBox = true;
    return <AppContainer />;
  }
}

export default App;
