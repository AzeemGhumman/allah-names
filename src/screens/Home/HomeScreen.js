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

import { Icon } from 'react-native-elements'

import Sound from 'react-native-sound'

import Video from 'react-native-video';

import Slider from "react-native-slider";

import { FlatList } from 'react-native-gesture-handler';

import names_json from '../../../assets/data/names.json';
import timings_json from '../../../assets/data/timings.json';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCoffee, faStop, faPlay } from '@fortawesome/free-solid-svg-icons'

const screenWidth = Dimensions.get("window").width;
// const totalColumns = 4;
const nameCellWidth = 80;
const nameCellHeight = 70;
const fontSizeArabic = 22.5;
const fontSizeArabicSmall = 10.0;
const fontSizeArabicSmallThreshold = 15.0;
const fontSizeTranslation = 13.00

const maxTotalColumns = 10;

const startNameID = 1; // 10
const endNameID = 99; // 19

const completeAudioPath = "complete"
const AllahTotalNames = 99; 


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

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      names_data: null,
      selected_name: startNameID, 
      total_columns: null, 
      msg: "hello world",
      audio_playing: false,
      // audio_current_time: 0, 
      play_btn_status: "Play",
      repeat_btn_status: "Repeat",
      repeat_audio: true,  
      speed_btn_status: "1x", 
      audio_speed: 1.0,
      slider_start_ts: 0, 
      slider_end_ts: 0, 
      slider_value: 0.0, 
    };
  }

  getScrollIndex = (name) => {
    var total_columns = this.state.total_columns;
    console.log(name + " / " + startNameID + " / " + total_columns)
    // var result = Math.ceil(parseInt(name) / total_columns) - startNameID;
    var result = Math.floor((parseInt(name) - startNameID) / total_columns);

    if (result <= 0) {
      return 0;
    }
    return result;
  }

  // Play audio
  playSpecificName = (name) => {

    this.pauseAudio();

    // Enable playback in silence mode
    Sound.setCategory('Playback');

    var audio_filepath = 'name_' + name + '.ogg';

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

  seekAudioToName = (name) => {

    // Seek to start timestamp of selected name
    var seek_time = this.getStartTimeForName(name);
    // this.setState({audio_current_time: seek_time});
    
    this.player.seek(seek_time, 10);

    // Update slider position
    var slider_value = this.getSliderPositionFromTimestamp(seek_time);
    // console.log("s-val: " + slider_value);
    // this.setState({ slider_value: slider_value });
  }

  // Name Pressed
  callback_namePressed = (item) => {

    // Pause audio
    this.pauseAudio();

    this.setState({ selected_name: item.id });

    // Scroll to selected name
    // var name_index = this.getScrollIndex(item.id);
    // this.flat_list.scrollToIndex({animated: true, index: name_index });

    // Seek to start timestamp of selected name
    var seek_time = this.getStartTimeForName(item.id);
    // Update slider position
    var slider_value = this.getSliderPositionFromTimestamp(seek_time);
    this.setState({ slider_value: slider_value });

    console.log(item.id + " -> " + seek_time);

    this.seekAudioToName(item.id);
  }

  pauseAudio = () => {
    this.setState({audio_playing: false});
    this.setState({play_btn_status: "Play"});
  }

  playAudio = () => {

    this.seekAudioToName(this.state.selected_name);

    this.setState({audio_playing: true});
    this.setState({play_btn_status: "Pause"});
  }

  // Play button pressed
  callback_playPressed = () => {

    // Toggle play/pause state 
    if (this.state.audio_playing) {
      this.pauseAudio();
    }
    else {
      this.playAudio();
    }
  }

  // Repeat button pressed
  callback_repeatPressed = () => {
    // Change button label
    if (this.state.repeat_audio) {
      this.setState({repeat_btn_status: "Repeat Off"});
      this.setState({repeat_audio: false });
    }
    else {
      this.setState({repeat_btn_status: "Repeat"});
      this.setState({repeat_audio: true });
    }
  }

  // Speed button pressed
  callback_speedPressed = () => {
    // Change button label
    if (this.state.audio_speed == 1.0) {
      this.setState({speed_btn_status: "1.5x"});
      this.setState({audio_speed: 1.5 });
    }
    else if (this.state.audio_speed == 1.5) {
      this.setState({speed_btn_status: "0.75x"});
      this.setState({audio_speed: 0.75 });
    }
    else {
      this.setState({speed_btn_status: "1x"});
      this.setState({audio_speed: 1.0 });
    }
  }

  // Sound button pressed
  callback_soundPressed = () => {
    // Play name audio
    this.playSpecificName(this.state.selected_name);
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

    // Load dataset since the cell ordering depends on total_columns
    var names_data = this.loadNames(names_json, startNameID, endNameID, total_columns);
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

    if (item.id == state.selected_name) {
      return (
        <TouchableOpacity 
          style={styles.selected_name_cell}
          onPress={() => callback_method(item)}>
          <Text
            style={{fontSize: arabic_font_size, fontFamily: "arabic", justifyContent: 'center', alignItems: 'center', flex: 1, lineHeight: nameCellHeight / 2}}
          >{item.arabic}</Text>
          <Text style={{fontSize: fontSizeTranslation, fontFamily: "urdu"}}>{item.urdu}</Text>
        </TouchableOpacity>
      );  
    }
  
    return (
      <TouchableOpacity 
        style={styles.name_cell}
        onPress={() => callback_method(item)}>
        <Text
          style={{fontSize: arabic_font_size, fontFamily: "arabic", justifyContent: 'center', alignItems: 'center', flex: 1, lineHeight: nameCellHeight / 2}}
        >{item.arabic}</Text>
        <Text style={{fontSize: fontSizeTranslation, fontFamily: "urdu"}}>{item.urdu}</Text>
      </TouchableOpacity>
    );
  }


  loadNames = (json_file, start_index, end_index, total_columns) => {

    var result = [];
    var row = [];
    
    var counter = 1;
    for (var index = start_index; index <= end_index; index++) {
      var item = json_file[String(index)];
      row.push({"id": String(index), "arabic": item.arabic, "urdu": item.urdu});
  
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

    // Add timings data to state
    this.setState({ timings: timings_json });

    // console.log(timings_json);

    // console.log(this.getNameFromTimestamp(10.0));
    // console.log(this.getNameFromTimestamp(12.0));
    // console.log(this.getNameFromTimestamp(14.0));

    // Set boundaries for the slider
    var start_time = this.getStartTimeForName(startNameID);
    this.setState({slider_start_ts: start_time});

    var end_time = this.getEndTimeForName(endNameID);
    this.setState({slider_end_ts: end_time});

    // Seek audio to first name
    this.seekAudioToName(startNameID);

  }

  getNameFromTimestamp = (ts) => {

    for (var name = 1; name <= AllahTotalNames; name ++) {
      if (ts < this.getEndTimeForName(name)) {
        return name;
      }
    }

    // Invalid name -> 100th which does not exist
    return AllahTotalNames + 1;
  }

  getStartTimeForName = (name) => {
    return timings_json[name - 1];
  }

  getEndTimeForName = (name) => {
    return timings_json[name];
  }

  getSliderPositionFromTimestamp = (ts) => {
    var start = this.state.slider_start_ts;
    var end = this.state.slider_end_ts;
    return (ts - start) / (end - start); 
  }

  onLoad = data => {
    // this.setState({ duration: data.duration });

    // console.log("onLoad: " + data.duration);
  };

  onProgress = data => {
    // this.setState({ audio_current_time: data.currentTime });
    // console.log("onProgress: " + data.currentTime);

    // Update slider position
    var slider_value = this.getSliderPositionFromTimestamp(data.currentTime);
    this.setState({ slider_value: slider_value });

    console.log("sss: " + slider_value);

    // Select the current name
    var selected_name = this.getNameFromTimestamp(data.currentTime);

    // If audio goes beyond the last name, either stop or start over based on repeat setting
    if (parseInt(selected_name) > parseInt(endNameID)) {
      // If repeat
      if (this.state.repeat_audio) {
        console.log("start over");

        this.setState({ selected_name: startNameID });
        this.seekAudioToName(startNameID);

      }
      else {
        this.pauseAudio();
        console.log("stop");
      }
    }
    else {
      this.setState({ selected_name: selected_name });
    }

    // Scroll to selected name
    var name_index = this.getScrollIndex(selected_name);
    this.flat_list.scrollToIndex({animated: true, index: name_index });


  };

  videoError() {
    console.log("videoError");
  }

  onEnd = () => {
    this.setState({ audio_playing: false });
    console.log("onEnd");
  };

  // onSeek = data => {
  //   this.player.seek(data);
  //   console.log("onSeek: " + data.currentTime);
  // }

  // getCurrentTimePercentage() {
  //   if (this.state.audio_current_time > 0) {
  //     return (
  //       parseFloat(this.state.audio_current_time) / parseFloat(this.state.duration)
  //     );
  //   }
  //   return 0;
  // }

  // soundBackward = () => {
  //   if (!this.state.audio_playing) {
  //     this.player.seek(this.state.audio_current_time - 5);
  //   }
  // };

  onSlidingStart = (value) => {
    this.pauseAudio();
  };

  onValueChange = (value) => {

    var selected_name = this.getNameFromSliderValue(value);
    // Update selected name
    this.setState({ selected_name: selected_name });

    // Scroll to selected name
    var name_index = this.getScrollIndex(selected_name);
    this.flat_list.scrollToIndex({animated: true, index: name_index });
  };

  onSlidingComplete = (value) => {

    var selected_name = this.getNameFromSliderValue(value);
    // Seek audio
    this.seekAudioToName(selected_name);
  };

  getNameFromSliderValue = (slider_value) => {
    var start = this.state.slider_start_ts;
    var end = this.state.slider_end_ts;

    // Calculate timstamp from slider
    var current_time = start + slider_value * (end - start);

    // Find selected name
    return this.getNameFromTimestamp(current_time);
  };

  render() {

    const state = this.state;
    const { navigate } = this.props.navigation;
    
    return (
        <View onLayout={this.callback_layoutChanged} style={styles.container}>
          <FlatList
            style={styles.list}
            data={state.names_data}
            ref={ref => {this.flat_list = ref;}}
            renderItem={({ item }) => <this.NameCell item = {item} callback_method = {this.callback_namePressed} state = {state} />}
            numColumns={state.total_columns}
            key={state.total_columns}
            keyExtractor={item => item.id}
            extraData={state}
            // initialScrollIndex={this.state.selected_name}
          />
    
        <View style={{flexDirection: "row", justifyContent: "center"}}>
        <Button
          title="PRONOUNCE"
          onPress={this.callback_soundPressed}
        />
        <Button
          color='#112233'
          title={state.play_btn_status}
          onPress={this.callback_playPressed}
        />
        <Button
          title={state.repeat_btn_status}
          onPress={this.callback_repeatPressed}
        />
        <Button
          title={state.speed_btn_status}
          onPress={this.callback_speedPressed}
        />
        </View>

        <View>
        <Slider
          style={{width: 300}}
          value={this.state.slider_value}
          minimumValue={0}
          maximumValue={1}
          onValueChange={value => this.onValueChange(value)}
          onSlidingComplete={value => this.onSlidingComplete(value)}
          onSlidingStart={value => this.onSlidingStart(value)}
        />
        </View>    

        <Video
            source={{ uri: completeAudioPath }}
            ref={ref => {
            this.player = ref;
            }}
            onBuffer={this.onBuffer}
            paused={!this.state.audio_playing}
            onLoad={this.onLoad}
            onProgress={this.onProgress}
            onEnd={this.onEnd}
            repeat={false}
            onError={this.videoError}
            playWhenInactive={true}
            playInBackground={true}
            progressUpdateInterval={500.0}
            rate={this.state.audio_speed}
        />

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
      width: nameCellWidth,
      height: nameCellHeight,
      borderRadius: 0,
      borderWidth: 1, 
      borderColor: '#0467b3',
    },
    selected_name_cell: {
      backgroundColor: '#60a0ff',
      padding: 0,
      marginVertical: 2,
      marginHorizontal: 2,
      alignItems: 'center',
      width: nameCellWidth,
      height: nameCellHeight,
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
        width: nameCellWidth,
        height: nameCellHeight,
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