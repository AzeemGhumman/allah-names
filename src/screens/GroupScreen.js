import React from "react";
import {
  TouchableOpacity,
  TouchableHighlight,
  Button,
  View,
  Text,
  Image,
  Platform,
  StyleSheet,
  Alert,
  Dimensions, 
} from "react-native";
// import { NavigationEvents } from "react-navigation";

import { CheckBox } from 'react-native-elements'

import { Icon } from 'react-native-elements'

var RNFS = require("react-native-fs");


import { FlatList } from 'react-native-gesture-handler';


import {styles} from '../common/styles.js'; 

import groups_json from '../../assets/data/groups.json';

const screenWidth = Dimensions.get("window").width;

const totalGroups = 9;
const fontSizeArabic = 22.5

const checkedColor = "green";
const checkedIcon = "check";

const uncheckedColor = "#bb8877";
const uncheckedIcon = "checkbox-passive";

const checksFilepath = RNFS.DocumentDirectoryPath + "/checks.txt";



export default class GroupScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      some_data: null, 
    };
  }

  async readCheckmarks() {
    try {
      const check_file = await RNFS.readFile(checksFilepath, "utf8");
      console.log("file contents: " + check_file);
      return check_file;
    } catch (e) {
      console.log("Error: reading file ....");
    }
  }

  loadGroups = (checkmarks) => {
    var result = [];
    for (var index = 1; index <= totalGroups; index ++) {
      var item = groups_json[index];

      var checked = checkmarks[index - 1];
      // var checked = true;
      
      var color = uncheckedColor;
      var style = styles.unchecked_group_cell;
      var icon = uncheckedIcon;

      if (checked) {
        color = checkedColor;
        style = styles.checked_group_cell;
        icon = checkedIcon;
      }

      result.push({"pos": index, "id": item.id, "startName": item.startName, "endName": item.endName, "start": item.start, "end": item.end, "checked": checked, "checked_icon": icon, "checked_color": color, "style": style});
    }
    return result;
  };

  callback_groupPressed = (item) => {
    this.props.navigation.navigate("Home", {
      startNameID: item.start,
      endNameID: item.end,
    });
  };

  // Layout changed
  callback_layoutChanged = () => {

  };

  getChecksFromString = (checks_code) => {
    var checks = []
    for (var index = 0; index < checks_code.length; index ++) {
      if (checks_code.charAt(index) == '0') {
        checks.push(false);
      }
      else {
        checks.push(true);
      }
    }
    return checks;
  }

  getStringFromChecks = (checks) => {
    console.log(checks);
    var result = "";
    for (var index = 0; index < checks.length; index ++) {
      if (checks[index] == true) {
        result += "1";
      }
      else {
        result += "0";
      }
    }
    return result;
  }

  checkboxToggled = (item) => {

    // Toggle the checked field of the clicked checkbox
    var groups = this.state.groups;

    if (groups[item.pos - 1].checked) {
      groups[item.pos - 1].checked_icon = uncheckedIcon;
      groups[item.pos - 1].checked_color = uncheckedColor;
      groups[item.pos - 1].style = styles.unchecked_group_cell;
    }
    else {
      groups[item.pos - 1].checked_icon = checkedIcon;
      groups[item.pos - 1].checked_color = checkedColor;
      groups[item.pos - 1].style = styles.checked_group_cell;
    }

    groups[item.pos - 1].checked = !groups[item.pos - 1].checked;
    this.setState({groups: groups.slice()});


    // Toggle state in memory
    var checks = [];
    for (var i = 0; i < groups.length; i ++) {
      checks.push(groups[i].checked);  
    }
    var checks_code = this.getStringFromChecks(checks);
    console.log("code -> " + checks_code);
    this.writeChecksFile(checks_code);

  };

  GroupCell({ item, callback_method, toggle_checkbox, state }) {

    return (
      <View style={item.style}>
      <TouchableOpacity 
        style={styles.group_name_cell}
        onPress={() => callback_method(item)}>
        <Text>({item.id})</Text>  
        <Text style={{fontFamily: "arabic", fontSize: fontSizeArabic}}> {item.startName}</Text>
        <Text style={{fontFamily: "arabic", fontSize: fontSizeArabic}}> {item.endName}</Text>
      </TouchableOpacity>

        <View
          style={{width: '100%'}}
          >
          <Icon
            type="fontisto"
            color={item.checked_color}
            name={item.checked_icon}
            onPress={() => toggle_checkbox(item)} 
            />
        </View>
      </View>
    );
  }

  writeChecksFile = (content) => {
    // Create new file
    
    RNFS.writeFile(checksFilepath, content, "utf8")
    .then(success => {
      console.log("file written");
    })
    .catch(err => {
      console.log("Error writing file: " + err.message);
    });
  };


  componentDidMount() {
    
    RNFS.exists(checksFilepath).then(exists => {
      if (exists) {
        // Read existing file
        var that = this;
        that.readCheckmarks().then(function (result) {
          // Load groups
          var checks = that.getChecksFromString(result);
          var groups = that.loadGroups(checks);
          that.setState({groups: groups});
        });
      } else {
        console.log("creating new file ..");
        var base_code = '0'.repeat(totalGroups);
        this.writeChecksFile(base_code);
        // Load groups
        var checks = this.getChecksFromString(base_code);
        var groups = this.loadGroups(checks);
        this.setState({groups: groups});
      }
    });
  }

  render() {

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
      <View onLayout={this.callback_layoutChanged} style={styles.container}>
          
          <FlatList
            data={state.groups}
            renderItem={({ item }) => <this.GroupCell item = {item} callback_method = {this.callback_groupPressed} toggle_checkbox = {this.checkboxToggled} state = {state} />}
            numColumns={3}
            keyExtractor={item => item.id}
            extraData={state}
          />
      </View>
      );
  }
}