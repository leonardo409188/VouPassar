import React from 'react';
import firebase from 'react-native-firebase';
import FBSDK, {LoginManager, AccessToken} from 'react-native-fbsdk';
import { StyleSheet, View, Dimensions, ActivityIndicator } from 'react-native';
import { Item, Input, Label, Button,Text, Icon, Root } from 'native-base';
import { labels, messages, routeNames, config, errorCodes } from '../../utils/constants';
import { Modal } from '../../components/modal';
import { checkInputsLogin, getMessageModal } from '../../utils/functions/functions';

const width = Dimensions.get('screen').width;
const firebaseAuth = firebase.auth();

export default class Login extends React.Component {

state = { 
  isVisible: false, 
  isLoading: false, 
  isLoadingFacebook: false 
}
  
handleLogin = () => {
  const { email, password } = this.state;
  const check = checkInputsLogin(email, password);

  if (check) {
      this.setState({ isLoading: true })
      firebaseAuth.signInWithEmailAndPassword(email, password).then(() => {
      firebaseAuth.onAuthStateChanged(user => {
        if (user !== null) {
          var check = user.providerData[0].providerId;
            
          if (!user.emailVerified && check !== labels.facebookUrl) {
            this.props.navigation.navigate(routeNames.EmailVerification)  //se o usuário ainda não tiver verificado o email, manda para a tela de verificação
          }
          else if (user.emailVerified) {
            this.props.navigation.navigate(routeNames.Home)   // se ja tiver verificado manda pra home
          }
          else if (check === labels.facebookUrl) {
            this.props.navigation.navigate(routeNames.Home)    // se for usuário autenticado pelo Facebook manda pra home (não precisa verificar email)
          }
        }
      })
    }).catch ((error) => {
      const messageModal = getMessageModal(error.code);
      this.showModal(messageModal); 
    });
  } else {
    this.showModal(messages.pleaseInsertPassword);
  }  
}

handleFacebookLogin = () => {
  LoginManager.logInWithPermissions([config.public_profile, config.email]).then((result) => {
      if (result.isCancelled) {
        this.showModal(messages.facebookCanceledLogin);
      } else {
        this.setState({ isLoadingFacebook: true })

        AccessToken.getCurrentAccessToken().then((accessTokenData) => {
          const credential = firebase.auth.FacebookAuthProvider.credential(accessTokenData.accessToken)
          firebaseAuth.signInWithCredential(credential).then(() => { // após login dar sucesso ele verifica se é primeiro login ou não.
             const { currentUser } = firebaseAuth;
             const uid = currentUser.uid;

            firebase.database().ref('usuarios/').once('value' , (snapshot) => {
              if (snapshot.hasChild(uid) === true) {
                this.props.navigation.navigate(routeNames.Home)
              }
              else {
                this.props.navigation.navigate(routeNames.PerformanceSettings)
              }
            })
             
          }, (error) => {
              const messageModal = getMessageModal(error.code)
              this.showModal(messageModal);
          })
        }, (error => {
          this.showModal(messages.error)
        }))
    }
   }, 
   (error => {
     if(error.code === errorCodes.eunspecified){
       this.showModal(messages.networkError)
     }
   })
  );
}

showModal = (text) => {
  this.setState({ 
    isVisible: true,
    msgModal : text,
    isLoading: false,
    isLoadingFacebook: false
  });
};

closeModal = () => {
  this.setState({ isVisible: false });
};
 
  render() {
    return (
      <Root>
        <View style={styles.container} >
          <View style={styles.login}>
            <Text style={styles.loginTitle}><Icon type="AntDesign" name="user" style={{color: '#fff'}}/>
              {labels.login}
            </Text>
          </View>

          <View style={styles.formContainer}>
              <Item style={{ borderBottomColor: '#a5a5a5' }} floatingLabel>
                <Label style={styles.imputLabel}>
                  {labels.email}
                </Label>
                <Input onChangeText={email => this.setState({ email })}
                      style={{color: 'gray'}}
                      value={this.state.email} />
              </Item>

              <Item style={{ borderBottomColor: '#a5a5a5', marginTop: 10 }} floatingLabel >
                <Label style={styles.imputLabel}> {labels.password}</Label>
                <Input error onChangeText={password => this.setState({ password })}
                       style={{color: 'gray'}}
                       secureTextEntry
                       value={this.state.password}/>
              </Item>

              <Button style={styles.buttonLogin}     
                      onPress={this.handleLogin}>
                {!this.state.isLoading ?        
                <Text style={{textAlign: 'center'}}>{labels.doLogin}</Text>
                :
                <ActivityIndicator size="small" color="#fff" />
                }
              </Button> 

              <View style={styles.viewNewUser}>
                <Text style={styles.textNewUser} onPress={() => this.props.navigation.navigate('ForgetPassword')}>{labels.forgotPassword}</Text>
                  <Text style={{marginLeft: 10, marginRight: 10, color: '#a5a5a5'}}>|</Text>
                  <Text style={styles.textNewUser} onPress={() => this.props.navigation.navigate('SignUp')}>{labels.register}</Text>
              </View>

              <View style={styles.viewNewUser}>
              <Text style={styles.textRegister}>{labels.facebookLogin}</Text>
              </View>

              <Button style={styles.buttonFacebookLogin} onPress={this.handleFacebookLogin}>
                {
                !this.state.isLoadingFacebook 
                ?        
                  <Text style={{textAlign: 'center'}}><Icon type="FontAwesome" style={{color: '#fff', marginRight: 5, fontSize: 18}} name='facebook-square' />{labels.labelFacebook}</Text>
                :
                 <ActivityIndicator size="small" color="#fff" />
                }
               
              </Button> 

              <Modal  isVisible={this.state.isVisible}
                      messageModal={this.state.msgModal}
                      labelButton={labels.understand}
                      onPress={this.closeModal} /> 
      
          </View>
      </View>
    </Root>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    justifyContent: 'center',
    alignItems: 'center',
    width: width
  },
  login: {
    width: '100%',
    height: 150,
    backgroundColor: '#279bce',
    padding: 30
  },

  loginTitle:{
    color: '#fff',
    fontFamily: 'OpenSans',
    fontSize: 30,
    fontWeight: "400",
    textAlign: 'center',
  },

  formContainer:{
    padding: 30,
    paddingTop: 15,
    width: '85%',
    minHeight: 180,
    height: 'auto',
    backgroundColor: '#fff',
    marginTop: -50,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 9 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 8,
    shadowColor: 'black',
    shadowOpacity: 1.0,
  },
  buttonLogin:{
    marginTop: 30,
    marginBottom: 15,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
  },

  viewNewUser:{
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  textRegister:{
    color: '#a5a5a5',
    marginTop: 40
  },
  buttonFacebookLogin:{
    marginTop: 15,
    backgroundColor: '#395794',
    justifyContent: 'center',
  },

  imputLabel:{
    color: 'gray',
  },

  textNewUser:{
    color: 'gray',
    fontFamily: 'Open Sans'
  },

  errorText: { 
    color: 'red',
    marginLeft: 3, 
    fontSize: 11,
    marginTop: 5, 
    fontWeight: '400', 
    fontFamily: 'Open Sans' 
  }
})

