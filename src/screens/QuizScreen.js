import React from "react";
import {
  TouchableOpacity,
  Button,
  View,
  Text,
  Dimensions, 
} from "react-native";


import { FlatList } from 'react-native-gesture-handler';

import { Icon } from 'react-native-elements'

import names_json from '../../assets/data/names.json';

const screenWidth = Dimensions.get("window").width;

import {nameCellWidth, nameCellHeight, maxTotalColumns, fontSizeArabic, fontSizeArabicSmall, fontSizeArabicSmallThreshold, fontSizeTranslation, AllahTotalNames, QuizTotalNames} from '../common/helper.js'; 

import {styles} from '../common/styles.js';

export default class QuizScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      start_name_id: null,
      end_name_id: null, 
      names_data: null,
      selected_name: null, 
      total_columns: null, 
      first: null,
      second: null,
      wrong: null, 
      status: 'nothing', 
      allow_restart: false,
      is_won: false,
      is_lost: false,  
    };
  }

  // Name Pressed
  callback_namePressed = (item) => {

    var current = item.id;
    var first = this.state.first;
    var second = this.state.second;
    var status = this.state.status;

    this.setState({ selected_name: item.id });

    if (status == 'nothing') {
      if (current == first) {
        this.setState({status: "first"});
      }
      else if (current == second) {
        this.setState({status: "second"});
      }
      else {
        this.setState({status: "lost"});
        this.setState({is_lost: true});
      }
    }
    else if (status == 'first') {
      if (current == first) {
        return;
      }
      if (current == second) {
        this.setState({status: "won"});
        this.setState({is_won: true});
      }
      else {
        this.setState({status: "lost"});
        this.setState({is_lost: true});
      }
    }
    else if (status == 'second') {
      if (current == second) {
        return;
      }
      if (current == first) {
        this.setState({status: "won"});
        this.setState({is_won: true});
      }
      else {
        this.setState({status: "lost"});
        this.setState({is_lost: true});
      }
    }
  }

  // Layout changed
  callback_layoutChanged = () => {

    // Calculate columns
    var width = Dimensions.get("window").width;
    var total_columns = Math.floor(width / nameCellWidth);

    if (total_columns > maxTotalColumns) {
      total_columns = maxTotalColumns;
    }
    this.setState({total_columns: total_columns});
    
    // Load random names
    var names_data = this.loadNames(total_columns);
    this.setState({ names_data: names_data });

  }

  NameCell({ item, callback_method, state }) {

    if (item.arabic == null) {
      return (
        // Return empty view
      <View style={styles.empty_name_cell}></View>
      );
    }
  
    var arabic_font_size = fontSizeArabic;
    if (item.arabic.length > fontSizeArabicSmallThreshold) {
      arabic_font_size = fontSizeArabicSmall;
    }

    // default style
    var style = styles.name_cell;
    
    if (state.status == 'first' || state.status == 'second') {
      // Correct guess
      if (item.id == state.selected_name) {
        if (item.id == state.first || item.id == state.second) {
          style = styles.quiz_correct_cell;  
        }
        else {
          style = styles.quiz_wrong_cell;
        }
      }
    }

    else if (state.status == 'won') {
      // Correct guess
      if (item.id == state.first || item.id == state.second) {
        style = styles.quiz_correct_cell;  
      }
    }

    else if (state.status == 'lost') {
      // Correct guess
      if (item.id == state.first || item.id == state.second) {
        style = styles.quiz_correct_cell;  
      }
      else {
        style = styles.quiz_wrong_cell;
      }
    }

    return (
        <TouchableOpacity 
          style={style}
          onPress={() => callback_method(item)}>
          <Text
            style={{fontSize: arabic_font_size, fontFamily: "arabic", justifyContent: 'center', alignItems: 'center', flex: 1, lineHeight: nameCellHeight / 2}}
          >{item.arabic}</Text>
          <Text style={{fontSize: fontSizeTranslation, fontFamily: "urdu"}}>{item.urdu}</Text>
        </TouchableOpacity>
      );
  }

  loadNames = (total_columns) => {

    var result = [];
    var row = [];

    var start_id = this.state.start_name_id;
    var end_id = this.state.end_name_id;
    var first = this.state.first;
    var second = this.state.second;

    var counter = 1;
    for (var index = start_id; index <= end_id; index++) {
      var item = names_json[String(index)];
      var id = String(index);

      // Swap first and second names
      if (index == first) {
        item = names_json[String(second)]
        id = String(second);
      }
      else if (index == second) {
        item = names_json[String(first)]
        id = String(first);
      }

      row.push({"id": id, "arabic": item.arabic, "urdu": item.urdu});
  
      if (counter % total_columns == 0) {
        result = result.concat(row.reverse());
        row = [];
      }
      counter += 1;
    }
  
    // Concatenate any left over elements from last row 
    while (row.length < total_columns) {
      row.push({"id": "PlaceHolder: " + String(row.length), "arabic": null, "urdu": null})
    }
  
    result = result.concat(row.reverse());
    return result;
  }

  componentDidMount() {
    // Init setup
    this.generateQuiz();
  }

  generateQuiz = () => {

    // Generate random range of names
    var startID = Math.floor(Math.random() * Math.floor(AllahTotalNames - QuizTotalNames)) + 1;
    var endID = startID + QuizTotalNames - 1;

    // Generate 2 random numbers: Cannot be the first name
    var first = Math.floor(Math.random() * Math.floor(QuizTotalNames - 1)) + 1;
    var second = first;
    while (second == first) {
      second = Math.floor(Math.random() * Math.floor(QuizTotalNames - 1)) + 1;
    }
    first += startID;
    second += startID;

    this.setState({start_name_id: startID});
    this.setState({end_name_id: endID});
    this.setState({first: first});
    this.setState({second: second});

    // Reset game state machine
    this.setState({status: "nothing"});
    this.setState({is_lost: false});
    this.setState({is_won: false});
  }

  render() {

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
        <View 
          style={{backgroundColor: '#b8d2e6', flex: 1}}>
        <Text 
          style={{padding: 20, fontFamily: 'english'}}
          >Click on the two names that are swapped with each other.</Text>
        <View onLayout={this.callback_layoutChanged} style={styles.quiz_container}>
          <FlatList
            data={state.names_data}
            ref={ref => {this.flat_list = ref;}}
            renderItem={({ item }) => <this.NameCell item = {item} callback_method = {this.callback_namePressed} state = {state} />}
            numColumns={state.total_columns}
            key={state.total_columns}
            keyExtractor={item => item.id}
            extraData={state}
          />
          { this.state.is_won && 
          <Icon
            size={50}
            style={{alignContent: "flex-start"}}
            type="font-awesome"
            color="green"
            name="thumbs-o-up"
            />
          }

          { this.state.is_lost && 
          <Text style={{fontSize: 20, fontWeight: "bold", color: "#cc8822"}}>Wrong Answer</Text>
          }

          { (this.state.is_lost || this.state.is_won) && 
          <Button 
            style={{marginVertical: 50}}
          title="PLAY AGAIN"
          onPress={this.generateQuiz}
          />
          }
        </View>
        </View>
      );
  }
}

/*
TODO: 
state machine using enumeration
Test on tablet
Change app name
Publish to play store
Ahmed feedback
Clean code
Push code to github with documenting the json files as artifacts
*/