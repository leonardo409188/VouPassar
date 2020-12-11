import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import firebase from 'react-native-firebase';
import { Button, Text, Spinner, Icon } from 'native-base';
import { config, labels, routeNames } from '../../utils/constants';
import { getUser } from '../../utils/functions/firebaseFunctions';

const width = Dimensions.get('screen').width;

export default class EmailVerification extends React.Component {
  state = { 
    currentUser: null, 
    nome: '', 
    email: '', 
    spinner: true, 
    button: false, 
    count: config.counter 
  }

  componentDidMount() {
    this.sendEmail();
  }

  sendEmail = () => {
    const currentUser = getUser();
    const emailVerified = currentUser.emailVerified;
    const email = currentUser.email;

    if (!emailVerified) {
      this.setState({ email });
      currentUser.sendEmailVerification().then(() => {
        this.resendCounter();
      }).catch(function() {
        this.resendCounter();
      });
    }
   
    this.intervalID = setInterval(() => {
      currentUser.reload();
      const emailVerified = currentUser.emailVerified;
      
      if (emailVerified) {
        this.setState({ 
          spinner: false,
          button: true
        });
        
        clearInterval(this.intervalID);
      }
    }, 2000); 
  }

  resendCounter = () => {
    this.intervalCount = setInterval(() => {
      var count = this.state.count;
      if (count !== 0) {
        count--
        this.setState({ count })
      }
      else {
        this.setState({ count: config.counter })
        clearInterval(this.intervalCount);
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalID, this.intervalCount);
  }

  logout = () => {
    firebase.auth().signOut().then(() => {
      this.props.navigation.navigate(routeNames.Login);
    })
  }

  render() {
    const { email, spinner, button } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.login}>
          <Text style={styles.loginTitle}><Icon type="AntDesign" name="mail" style={{ color: '#fff' }} />{labels.checkEmail}</Text>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.viewCenter}>
            <Text style={styles.loginSubtitle}>{labels.emailTo}{'\n'}{'\n'}<Text style={styles.emailTitle}>{email}</Text> {'\n'}{'\n'}{labels.backHere}</Text>
          </View>
          <View style={spinner ? styles.spinner : styles.viewSpinnerNone}>
            <Spinner size="" color="#279bce" />
             <Text style={{ marginTop: -15, fontFamily: 'Open Sans', fontWeight: '300', color: 'steelblue' }}>{labels.waitConfirmation}</Text>
          </View>
          <Button style={!button ? styles.buttonContinue : styles.buttonContinueBlock}
            onPress={() => firebase.auth().onAuthStateChanged(user => {
              this.props.navigation.navigate(user ? routeNames.PerformanceSettings : routeNames.SignUp)
            })}>
            <Text style={{ textAlign: 'center' }}>{labels.continue} </Text>
          </Button>

          {!button ?
            <View style={{ marginTop: 25, justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
              {this.state.count === 60 ?

                <Button  style={{ backgroundColor: 'steelblue', padding: 0, height: 40  }}>
                  <Text style={{ fontSize: 16, padding: 0, margin: 0, fontFamily: 'Roboto' }}
                    onPress={this.sendEmail}>{labels.resendEmail}</Text>
                </Button>

                :

                <Button  style={{ backgroundColor: 'rgba(70,130,180, .7)', padding: 0, height: 40 }}>
                  <Text style={{ fontSize: 16, padding: 0, margin: 0, fontFamily: 'Roboto' }}
                    >{labels.resendEmailIn} {this.state.count}</Text>
                </Button>

               
              }
            </View>

            :
            <View></View>
            }

          <Text style={styles.loginSubtitleVoltar}
                onPress={this.logout}>{labels.goBack}
          </Text>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width
  },

  login: {
    width: '100%',
    height: 150,
    backgroundColor: '#279bce',
    paddingTop: 30
  },

  emailTitle: {
    fontFamily: 'Open Sans',
    fontWeight: 'bold',
    fontSize: 20,
    color: 'steelblue'
  },

  viewSpinnerNone: {
    display: "none"
  },

  loginTitle: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontSize: 22,
    fontWeight: "400",
    textAlign: 'center'
  },

  loginSubtitle: {
    color: 'gray',
    fontFamily: 'Open Sans',
    marginBottom: 15,
    fontSize: 22,
    textAlign: "center"
  },

  loginSubtitleVoltar: {
    color: 'gray',
    fontFamily: 'Open Sans',
    marginTop: 30,
    fontSize: 18,
    textDecorationLine: 'underline'
  },

  viewSubtitle: {
    justifyContent: 'center',
    alignItems: 'center',

  },

  viewCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  formContainer: {
    padding: 15,
    width: '85%',
    backgroundColor: '#fff',
    marginTop: -55,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 9 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 8,
    shadowColor: 'black',
    shadowOpacity: 1.0,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',

  },

  buttonContinue: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
    display: 'none'
  },

  buttonContinueBlock: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
    display: 'flex',
  },

  viewNewUser: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  textRegister: {
    color: 'gray',
    marginTop: 40
  },

  buttonFacebookLogin: {
    marginTop: 15,
    backgroundColor: '#395794',
    justifyContent: 'center',
  },

  imputLabel: {
    color: 'gray',
  },

  textNewUser: {
    color: 'gray',
    fontFamily: 'Open Sans'
  },

  errorText: {
    color: 'red',
    marginLeft: 5,
    fontSize: 11,
    marginTop: 3,
    fontWeight: '400',
    fontFamily: 'Open Sans'
  }
})
