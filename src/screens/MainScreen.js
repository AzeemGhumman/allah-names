import React from "react";
import {
  View,
  Text,
} from "react-native";

import { TouchableOpacity } from 'react-native-gesture-handler';

import { Icon } from 'react-native-elements'

import {styles} from '../common/styles.js';

export default class MainScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      some_data: null, 
    };
  }

  onClickFullList = () => {
    this.props.navigation.navigate("Home", {
      startNameID: 1,
      endNameID: 99,
    });
  };

  onClickGroups = () => {
    this.props.navigation.navigate("Group", {
      // startNameID: 1,
      // endNameID: 9,
    });
  };

  onClickQuiz = () => {
    this.props.navigation.navigate("Quiz", {
    });
  }

  onClickInfo = () => {
    this.props.navigation.navigate("Info", {
    });
  }

  // Layout changed
  callback_layoutChanged = () => {
  }
  
  componentDidMount() {
    // Init setup
    console.log("init of main screen ...");
  }

  render() {

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
      <View onLayout={this.callback_layoutChanged}>

        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>

          <View style={{width: 100, height: 100}}>
          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickFullList}>
          <Icon type="font-awesome" color="blue" name="book" />
            <Text>99 Names</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickQuiz}>
          <Icon type="font-awesome" color="blue" name="question-circle" />
            <Text>Quiz</Text>
          </TouchableOpacity>

          </View>

          <View style={{width: 100, height: 100}}>
          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickGroups}>
          <Icon type="font-awesome" color="blue" name="list-ul" />
            <Text>Name Lists</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickInfo}>
          <Icon type="font-awesome" color="blue" name="info-circle" />
            <Text>Info</Text>
          </TouchableOpacity>
          </View>

        </View>


      </View>
      );
  }
}