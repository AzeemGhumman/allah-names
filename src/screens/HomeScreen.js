import React from "react";
import {
  TouchableOpacity,
  Button,
  View,
  Text,
  StyleSheet,
  Dimensions, 
} from "react-native";

var RNFS = require("react-native-fs");

import Sound from 'react-native-sound'

import Video from 'react-native-video';

import Slider from "react-native-slider";

import { FlatList } from 'react-native-gesture-handler';

import {nameCellWidth, nameCellHeight, maxTotalColumns, fontSizeArabic, fontSizeArabicSmall, fontSizeArabicSmallThreshold, fontSizeTranslation, AllahTotalNames} from '../common/helper.js'; 

import {styles} from '../common/styles.js'; 

import names_json from '../../assets/data/names.json';
import timings_json from '../../assets/data/timings.json';

const completeAudioPath = "complete"

const settingsFilepath = RNFS.DocumentDirectoryPath + "/settings.txt";

const SpeedLabel = {
  NORMAL: '1x',
  FAST: '1.5x',
  SLOW: '0.75x',
}

const SpeedNumber = {
  NORMAL: 1.0,
  FAST: 1.5,
  SLOW: 0.75,
}

const Repeat = {
  ON: "REPEAT ON",
  OFF: "REPEAT OFF", 
}

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);

    var startNameID = this.props.navigation.getParam("startNameID"); 
    var endNameID = this.props.navigation.getParam("endNameID");

    this.state = {
      start_name_id: startNameID,
      end_name_id: endNameID, 
      names_data: null,
      selected_name: startNameID, 
      total_columns: null, 
      audio_playing: false, 
      play_btn_status: "Play",
      repeat_btn_status: String(Repeat.ON),
      repeat_audio: true,  
      speed_btn_status: String(SpeedLabel.NORMAL), 
      audio_speed: SpeedNumber.NORMAL,
      slider_start_ts: 0, 
      slider_end_ts: 0, 
      slider_value: 0.0,
      settings: null, 
    };
  }

  async readSettings() {
    try {
      const check_file = await RNFS.readFile(settingsFilepath, "utf8");
      // console.log("file contents: " + check_file);
      return check_file;
    } catch (e) {
      console.log("Error: reading file: ", e);
    }
  }

  writeSettingsFile = (content) => {
    // Create new file
    RNFS.writeFile(settingsFilepath, JSON.stringify(content), "utf8")
    .then(success => {
      // console.log("file written");
    })
    .catch(err => {
      console.log("Error writing file: " + err.message);
    });
  };

  getSettingsFromText = (settings_text) => {
    return JSON.parse(settings_text);
  }

  getDefaultSettings = () => {
    return {
      'speed_label': SpeedLabel.NORMAL, 
      'speed_number': SpeedNumber.NORMAL, 
      'repeat': Repeat.ON, 
    }
  }

  applySettings = (settings) => {
    this.setState({speed_btn_status: settings.speed_label});
    this.setState({audio_speed: settings.speed_number });
    this.setState({repeat_btn_status: settings.repeat});

    if (settings.repeat == Repeat.ON) {
      this.setState({repeat_audio: true });
    }
    else {
      this.setState({repeat_audio: false });
    }
    
  }

  getScrollIndex = (name) => {
    var total_columns = this.state.total_columns;
    var result = Math.floor((parseInt(name) - this.state.start_name_id) / total_columns);

    // Clip negative results
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
    
    // seek time within 10ms 
    this.player.seek(seek_time, 10); 
  }

  // Name Pressed
  callback_namePressed = (item) => {

    // Pause audio
    this.pauseAudio();

    this.setState({ selected_name: item.id });

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

    var settings = this.state.settings;
    
    // Change button label
    if (this.state.repeat_audio) {
      this.setState({repeat_btn_status: Repeat.OFF});
      this.setState({repeat_audio: false });
      settings.repeat = Repeat.OFF;
    }
    else {
      this.setState({repeat_btn_status: Repeat.ON});
      this.setState({repeat_audio: true });
      settings.repeat = Repeat.ON;
    }

    // Write settings to file
    console.log(settings);
    this.writeSettingsFile(settings);
  }

  // Speed button pressed
  callback_speedPressed = () => {

    var settings = this.state.settings;

    // Change button label
    if (this.state.audio_speed == SpeedNumber.NORMAL) {
      this.setState({speed_btn_status: SpeedLabel.FAST});
      this.setState({audio_speed: SpeedNumber.FAST });
      settings.speed_label = SpeedLabel.FAST;
      settings.speed_number = SpeedNumber.FAST;
    }
    else if (this.state.audio_speed == SpeedNumber.FAST) {
      this.setState({speed_btn_status: SpeedLabel.SLOW});
      this.setState({audio_speed: SpeedNumber.SLOW });
      settings.speed_label = SpeedLabel.SLOW;
      settings.speed_number = SpeedNumber.SLOW;
    }
    else {
      this.setState({speed_btn_status: SpeedLabel.NORMAL});
      this.setState({audio_speed: SpeedNumber.NORMAL });
      settings.speed_label = SpeedLabel.NORMAL;
      settings.speed_number = SpeedNumber.NORMAL;
    }

    // Write settings to file
    this.writeSettingsFile(settings);
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


  loadNames = (total_columns) => {

    var result = [];
    var row = [];
    
    var counter = 1;
    for (var index = this.state.start_name_id; index <= this.state.end_name_id; index++) {
      var item = names_json[String(index)];
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

    // Read settings from file
    RNFS.exists(settingsFilepath).then(exists => {
      if (exists) {
        // Read existing file
        var that = this;
        that.readSettings().then(function (result) {
          var settings = that.getSettingsFromText(result);
          that.setState({'settings': settings});
          that.applySettings(settings);
          console.log(settings);
        });
      } else {
        // Write default settings
        this.writeSettingsFile(this.getDefaultSettings());
        this.setState({'settings': this.getDefaultSettings()});
        this.applySettings(this.getDefaultSettings());
      }
    });

    // Add timings data to state
    this.setState({ timings: timings_json });

    // Set boundaries for the slider
    var start_time = this.getStartTimeForName(this.state.start_name_id);
    this.setState({slider_start_ts: start_time});

    var end_time = this.getEndTimeForName(this.state.end_name_id);
    this.setState({slider_end_ts: end_time});

    // Seek audio to first name
    this.seekAudioToName(this.state.start_name_id);
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

  onLoad = (data) => {};

  onProgress = (data) => {

    // Update slider position
    var slider_value = this.getSliderPositionFromTimestamp(data.currentTime);
    this.setState({ slider_value: slider_value });

    // Select the current name
    var selected_name = this.getNameFromTimestamp(data.currentTime);

    // If audio goes beyond the last name, either stop or start over based on repeat setting
    if (parseInt(selected_name) > parseInt(this.state.end_name_id)) {
      // If repeat
      if (this.state.repeat_audio) {
        this.setState({ selected_name: this.state.start_name_id });
        this.seekAudioToName(this.state.start_name_id);
      }
      else {
        this.pauseAudio();
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
          />
    
        <View style={{flexDirection: "row", justifyContent: "space-around", width: "100%"}}>
        <Button
          title="PRONOUNCE"
          onPress={this.callback_soundPressed}
        />
        <Button
          color='#222222'
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
          style={{width: this.state.total_columns * nameCellWidth - 20}}
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