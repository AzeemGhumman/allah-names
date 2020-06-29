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

import Sound from 'react-native-sound'

import { FlatList } from 'react-native-gesture-handler';

import names_json from '../../../assets/data/names.json';

const screenWidth = Dimensions.get("window").width;
const totalColumns = 4;

// TODO: Ask Ahmed to help with custom font for arabic and urdu text
// TODO: How do I change state from callback method
// TODO: Audio Player for complete.mp4 at bottom of screen
// TODO: Set size of name and set number of columns based on screen dimensions - DONE
// Seek complete.mp4 based on which name user clicked.
// Select name based on where the complete.mp4 seeked value is.
// How to re-render when potrait and landscape modes switched. 
// Probably scroll flatlist to bring the current item in view: 
// 1. https://stackoverflow.com/questions/54662444/flatlist-react-native-how-i-can-focus-scroll-in-the-specific-list-item
// 2. https://aboutreact.com/scroll_to_a_specific_item_in_scrollview_list_view/
// Remove title bar to get more space

/*

Audio Recording and playback application
https://www.smashingmagazine.com/2018/04/audio-video-recording-react-native-expo/

Code: https://github.com/apiko-dev/Multimedia-Notes


Leaner example for now: 
https://stackoverflow.com/questions/55537889/implemtation-of-audio-progress-bar-in-react-native


*/


function playAudio(item) {
  
    // Enable playback in silence mode
    Sound.setCategory('Playback');

    var audio_filepath = 'name_' + item.id + '.ogg';

    console.log(audio_filepath);
  
    const sound = new Sound(
      audio_filepath,
      Sound.MAIN_BUNDLE,
      (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Playing sound');
          sound.play(() => {
            sound.release();
          });
        }
      }
    );
  
  }

function namePressed(item) {
    console.log("last selected: " + item.id);
    // this.setState({ selected_name: item.id });
  
    // Play name audio
    playAudio(item);
  }

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      names_data: null,
      selected_name: null, 
    };
  }

  NameCell({ item }) {

    console.log(item);

    if (item.arabic == null) {
      return (
        // Return empty view
      <View style={styles.empty_name_cell}></View>
      );
    }
  
    var image_path = 'http://icanmakemyownapp.com/islam/allah-names/' + item.id + '.gif';
  
    var arabic_font_size = 90 / totalColumns;
    if (item.arabic.length > 15) {
      arabic_font_size = 40 / totalColumns;
    }

    var translation_font_size = 45 / totalColumns;
  
    return (
      <TouchableOpacity 
        style={styles.name_cell}
        onPress={() => namePressed(item)}>
        {/* <Image style={styles.image} source={{uri: image_path}} /> */}
        <Text
          // style={styles.arabic}
          style={{fontSize: arabic_font_size, fontFamily: "arabic", justifyContent: 'center', alignItems: 'center', flex: 1, lineHeight: (screenWidth - (10 * totalColumns)) / totalColumns / 2}}
        >{item.arabic}</Text>
        <Text style={{fontSize: translation_font_size, fontFamily: "urdu"}}>{item.urdu}</Text>
      </TouchableOpacity>
    );
  }


  loadNames(json_file, start_index, end_index) {

    var row = [];
    var result = [];
  
  
    var counter = 1;
    for (var index = start_index; index <= end_index; index++) {
      var item = json_file[String(index)];
      row.push({"id": String(index), "arabic": item.arabic, "urdu": item.urdu});
  
      if (counter % totalColumns == 0) {
        result = result.concat(row.reverse());
        row = [];
      }
  
      counter += 1;
    }
  
    // Concatenate any left over elements from last row 
    while (row.length < totalColumns) {
      row.push({"id": "PlaceHolder: " + String(row.length), "arabic": null, "urdu": null})
    }
  
    result = result.concat(row.reverse());
  
    console.log(result);
    console.log(row)
  
    return result;
  }

  componentDidMount() {

    // Load dataset
    var names_data = this.loadNames(names_json, 1, 99);
    this.setState({ names_data: names_data });
    console.log(this.state.names_data);
  }

  render() {

    console.log("rendering home screen now ....");

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
        <View style={styles.container}>
          <FlatList
            style={styles.list}
            data={state.names_data}
            renderItem={({ item }) => <this.NameCell item = {item} />}
            numColumns={totalColumns}
            keyExtractor={item => item.id}
          />
    
        <Text>{state.msg}</Text>    
        </View>
      );
  }
}

const styles = StyleSheet.create({
  
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#b8d2e6',
    },
    name_cell: {
      backgroundColor: '#9fd0f5',
      padding: 0,
      marginVertical: 2,
      marginHorizontal: 2,
      alignItems: 'center',
      width: (screenWidth - (5 * totalColumns)) / totalColumns,
      height: 70,
      borderRadius: 0,
      borderWidth: 1, 
      borderColor: '#0467b3',
    },
    empty_name_cell: {
        backgroundColor: '#b8d2e6',
        padding: 0,
        marginVertical: 2,
        marginHorizontal: 2,
        alignItems: 'center',
        width: (screenWidth - (5 * totalColumns)) / totalColumns,
        height: 70,
        borderRadius: 0,
        borderWidth: 1, 
        borderColor: '#b8d2e6',
      },
    flex: {
      flex: 1,
    },
    list: {
      flex: 1,
    },
  
  });