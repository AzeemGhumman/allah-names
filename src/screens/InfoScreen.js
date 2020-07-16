import React from "react";
import {
  Button,
  View,
  Text,
  Linking, 
} from "react-native";

import qs from "qs";

const refUrl = "https://sunnah.com/bukhari/54/23";
const refTitle = "Sahih Al-Bukhari: 2736"

export default class QuizScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
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

  runEmailClient = () => {
    this.sendEmail(
      "azeemghumman3@gmail.com",
      "Allah Names App - User Email",
      "Following is my feedback: <br><br>"
    ).then(() => {
      console.log("Opened external email application");
    });
  };

  async sendEmail(to, subject, body, options = {}) {
    const cc = "";
    const bcc = "";

    let url = `mailto:${to}`;

    const query = qs.stringify({
      subject: subject,
      body: body,
      cc: cc,
      bcc: bcc
    });

    if (query.length) {
      url += `?${query}`;
    }

    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
      throw new Error("Provided URL can not be handled");
    }
    return Linking.openURL(url);
  }

  render() {

    const state = this.state;
    
    return (
        <View 
          style={{backgroundColor: '#b8d2e6', paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10, height: "100%"}}>
          
          <Text 
          style={{padding: 5, fontSize: 20, textAlign: 'center', borderWidth: 2, borderRadius: 3, borderColor: "#336699", color: "#336699", textDecorationLine: "underline"  }}
          onPress={this.refClicked}
          >
            {refTitle}
          </Text>

          <Text
            style={{fontSize: 20, padding: 10,  fontFamily: "arabic", }}
            >
                  إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمَا مِائَةً إِلاَّ وَاحِدًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ
          </Text>
          
          <Text 
            style={{fontSize: 20, padding: 10, fontFamily: "urdu", }}
            >
                رسول اللہ ﷺ نے فرمایا اللہ تعالیٰ کے ننانوے نام ہیں یعنی ایک کم سو ۔ جو شخص ان سب کو محفوظ رکھے گا وہ جنت میں داخل ہو گا ۔
          </Text>

          <Text 
          style={{fontSize: 15, paddingTop: 10, fontFamily: "english", }}
          >
              Allah's Messenger (ﷺ) said, "Allah has ninety-nine names, i.e. one-hundred minus one, and whoever knows them will go to Paradise." 
          </Text>

          <View style={{paddingTop: 30}}>
            <Button title="Send Feedback to Developers" onPress={this.runEmailClient} />
          </View>
        
        </View>
      );
  }
}