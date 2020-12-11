import React from 'react';
import { StyleSheet, View, Dimensions, ActivityIndicator } from 'react-native';
import firebase from 'react-native-firebase';
import { Item, Input, Label, Button, Text, Icon } from 'native-base';
import { checkInputsSignUp } from '../../utils/functions/functions';
import { routeNames, messages, labels } from '../../utils/constants';
import { Modal } from '../../components/modal';
import { getMessageModal } from '../../utils/functions/functions';

const width = Dimensions.get('screen').width;

export default class SignUp extends React.Component {
  
state = { 
  email: '', 
  password: '', 
  passwordConfirm: '', 
  errorMessage: null, 
  displayName: '', 
  msgModal: '0', 
  isLoading: false 
}

handleSignUp = () => {
  const { email, password, passwordConfirm, displayName } = this.state;
  const checkInputs = checkInputsSignUp(email, password, passwordConfirm, displayName);

  if (checkInputs) {
    this.setState({ isLoading: true })     
    firebase.auth().createUserWithEmailAndPassword(email, password).then(user => {
        var user = firebase.auth().currentUser;
        user.updateProfile({ displayName: displayName });
        this.props.navigation.navigate(routeNames.EmailVerification);
    })
    .catch(error => {
      const messageModal = getMessageModal(error.code);
      this.showModal(messageModal); 
    });
  }
  else if (displayName === '') {
    this.showModal(messages.insertName);
  }
  else if (!email.includes('@') || !email.includes('.com')) {
    this.showModal(messages.invalidEmail);
  }
  else if ((password && passwordConfirm) !== '') {
    this.showModal(messages.insertPassword);
  }
  else if (password !== passwordConfirm) {
    this.showModal(messages.samePassword);
  }
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
      <View style={styles.container}> 
        <View style={styles.login}>
          <Text style={styles.loginTitle}><Icon type="AntDesign" name="addusergroup" style={{color: '#fff'}}/>{labels.newSignUp}</Text>
        </View> 

        <View style={styles.formContainer}>
          <Item style={styles.input} floatingLabel >
            <Label style={styles.imputLabel}>{labels.name}</Label>
            <Input onChangeText={displayName => this.setState({ displayName })}
                   style={{color: 'gray'}}
                   value={this.state.displayName}/>
          </Item>

          <Item style={styles.input} floatingLabel >
            <Label style={styles.imputLabel}>{labels.email}</Label>
            <Input onChangeText={email => this.setState({ email })}
                   style={{color: 'gray'}}
                   value={this.state.email}/>
          </Item>

          <Item style={styles.input} floatingLabel >
            <Label style={styles.imputLabel}> {labels.password}</Label>
            <Input error onChangeText={password => this.setState({ password })}
                   style={{color: 'gray'}}
                   secureTextEntry
                   value={this.state.password}/>
          </Item>

          <Item style={styles.input} floatingLabel >
            <Label style={styles.imputLabel}>{labels.confirmPassword}</Label>
            <Input onChangeText={passwordConfirm => this.setState({ passwordConfirm })}
                   style={{color: 'gray'}}
                   secureTextEntry
                   value={this.state.passwordConfirm}/>
          </Item>

          <Button style={styles.buttonLogin}     
                onPress={this.handleSignUp}>
                {!this.state.isLoading ?        
                <Text style={{textAlign: 'center'}}>{labels.register}</Text>
                :
                <ActivityIndicator size="small" color="#fff" />
                }
          </Button>  

          <View style={styles.viewNewUser}>
              <Text style={styles.textNewUser} onPress={() => this.props.navigation.navigate(routeNames.Login)}>{labels.doLogin}</Text>
          </View>

          <Modal  isVisible={this.state.isVisible}
                  messageModal={this.state.msgModal}
                  labelButton={labels.understand}
                  onPress={this.closeModal} /> 
      </View>
    </View>  

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

  input: { 
    borderBottomColor: '#a5a5a5', 
    marginTop: 10 
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
    marginTop: 20
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
    fontFamily: 'Open Sans',
    fontSize: 18,
    textDecorationLine: 'underline'
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
