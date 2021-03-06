import React from "react";
import {
  View,
  Text,
  Image, 
} from "react-native";

import { TouchableOpacity } from 'react-native-gesture-handler';

import { Icon } from 'react-native-elements'

import {styles} from '../common/styles.js';

const iconPath = '../../assets/img/icon.png'

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      some_data: null, 
    };
  }

  onClickFullList = () => {
    this.props.navigation.navigate("Learn", {
      startNameID: 1,
      endNameID: 99,
    });
  };

  onClickGroups = () => {
    this.props.navigation.navigate("Group", {});
  };

  onClickQuiz = () => {
    this.props.navigation.navigate("Quiz", {});
  }

  onClickInfo = () => {
    this.props.navigation.navigate("Info", {});
  }

  // Layout changed
  callback_layoutChanged = () => {
  }
  
  componentDidMount() {
    // Init setup
  }

  render() {

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
      <View onLayout={this.callback_layoutChanged} style={{ flex: 1, backgroundColor: '#b8d2e6' }}>

      <View style={{flex: 0.5, flexDirection: 'row', justifyContent: "center", alignItems: "center", }} >
      <Image style={{width: 150, height: 150, }} source={require(iconPath)} />
      </View>

        <View style={{flex: 0.5, flexDirection: 'row', justifyContent: 'space-around' }}>
  
          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickFullList}>
          <Icon type="font-awesome" color="#60a0ff" name="book" size={50}/>
            <Text>99 Names</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickGroups}>
          <Icon type="font-awesome" color="#60a0ff" name="list-ul" size={50} />
            <Text>Sections</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickQuiz}>
          <Icon type="font-awesome" color="#60a0ff" name="question-circle" size={50} />
            <Text>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.main_menu_cell} onPress={this.onClickInfo}>
          <Icon type="font-awesome" color="#60a0ff" name="info-circle" size={50} />
            <Text>Info</Text>
          </TouchableOpacity>
          
        </View>
      </View>
      );
  }
}