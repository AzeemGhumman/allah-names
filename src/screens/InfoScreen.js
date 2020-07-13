import React from "react";
import {
  TouchableOpacity,
  Button,
  View,
  Text,
  Dimensions, 
  Linking, 
} from "react-native";

const refUrl = "https://sunnah.com/bukhari/54/23";

export default class QuizScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      
    };
  }

  componentDidMount() {
    // Init setup
  }

  refClicked = () => {
    Linking.canOpenURL(refUrl).then(supported => {
        if (!supported) {
          console.log('Error: Unsupported url');
        } else {
          return Linking.openURL(refUrl);
        }
      }).catch(err => console.error('An error occurred: ', err));
  };

  render() {

    const state = this.state;
    
    return (
        <View 
          style={{backgroundColor: '#b8d2e6', flex: 1}}>

        <Text
          style={{padding: 20, fontSize: 20, fontFamily: "arabic", }}
          >
                إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمَا مِائَةً إِلاَّ وَاحِدًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ
        </Text>
        
        <Text 
          style={{padding: 20, fontSize: 20, fontFamily: "urdu", }}
          >
              رسول اللہ ﷺ نے فرمایا اللہ تعالیٰ کے ننانوے نام ہیں یعنی ایک کم سو ۔ جو شخص ان سب کو محفوظ رکھے گا وہ جنت میں داخل ہو گا ۔
        </Text>

        <Text 
        style={{padding: 20, fontSize: 15 }}
        >
            Allah's Messenger (ﷺ) said, "Allah has ninety-nine names, i.e. one-hundred minus one, and whoever knows them will go to Paradise." 
        </Text>

        <Text 
        style={{padding: 20, fontSize: 15 }}
        onPress={this.refClicked}
        >
            {refUrl} 
        </Text>

        <Text>Contact Developer for any features and to report bugs ...</Text>
        

        </View>
      );
  }
}