import React from 'react'
import firebase from 'react-native-firebase'
import Dialog from "react-native-dialog";

import { 
      StyleSheet,  
      View, 
      Dimensions,
      ActivityIndicator
    } from 'react-native'

import { 
      Item,
      Input, 
      Label ,
      Button,
      Text,
      Icon
      } from 'native-base';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;


export default class Login extends React.Component {
  state = { displayName: null, currentUser: null, newUser: null, dialogVisible: false, msgModal: null, isLoading: false }

  componentDidMount() {
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    var displayName = currentUser.displayName
    this.setState({ displayName })
  }

  showDialog = () => {
    this.setState({ dialogVisible: true });
  };
 
  handleCancel = () => {
    this.setState({ dialogVisible: false });
  };

//alterar nome do usuário  
alterarNome = () =>{
    var  newUser = this.state.newUser
    var user = firebase.auth().currentUser;
    if (newUser == '' || newUser == null ) {
      this.setState({msgModal : "Por favor digite um nome."})
      this.showDialog();
    }else {
      this.setState({isLoading: true})
      user.updateProfile({
        displayName: newUser,
      }).then(() => {
        this.setState({msgModal : "Nome alterado com sucesso!", isLoading: false})
        this.showDialog();
        this.setState({displayName : newUser})
      }).then(() => {
        this.setState({newUser : null})
      })
      .catch(function(error) {
        this.setState({msgModal : "Ocorreu Algum erro, tente novamente", isLoading: false})
        this.showDialog();
      });
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <View style={styles.login}>
            <Text style={styles.loginTitle}><Icon type="FontAwesome" name="user" style={{color: '#fff'}}/> Alterar Nome</Text>
        </View>

        <Dialog.Container visible={this.state.dialogVisible}>
          <View style={{alignItems: 'center', marginTop: -25}}>
            <Dialog.Description>
              {this.state.msgModal}
            </Dialog.Description>
          </View>
          <View style={{alignItems: 'center', marginTop: 40}}>
            <Button small style={{backgroundColor: 'steelblue'}}>
              <Text  onPress={this.handleCancel}>Ok, entendi</Text>
            </Button>
          </View>
        </Dialog.Container>

        <View style={styles.formContainer}>
            <View style={styles.viewSubtitle}>
              <Text style={styles.loginSubtitle}>Nome de usuário atual: {this.state.displayName}</Text>
            </View>
              <Item style={{ borderBottomColor: 'gray' }} floatingLabel  style={styles.itemImput}>
                <Label style={styles.imputLabel}><Icon style={{color: 'gray', marginRight: 3, fontSize: 18}} name='person' /> Nome de usuário</Label>
                <Input onChangeText={newUser => this.setState({ newUser })}
                       style={{color: 'gray'}}
                       value={this.state.newUser} />
              </Item>
              <Text style={styles.errorText}>
                {this.state.error}
                {this.state.errorMessage}
              </Text>

              <Button style={styles.buttonLogin}     
                      onPress={this.alterarNome}>
                 {!this.state.isLoading ?        
                <Text style={{textAlign: 'center'}}>Alterar nome</Text>
                :
                <ActivityIndicator size="small" color="#fff" />
                }
              </Button>
          </View>
          <Text style={styles.loginSubtitleVoltar}
                onPress={() => this.props.navigation.navigate('Conta')}><Icon type="FontAwesome" name="arrow-left" style={{color: 'gray', fontSize: 18, textDecorationLine: 'none'}}/> Voltar</Text>  
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
  },

  loginTitle:{
    color: '#fff',
    fontFamily: 'OpenSans',
    fontSize: 30,
    fontWeight: "400",
    textAlign: 'center',
    marginTop: 30
  },

  loginSubtitle:{
    color: 'gray',
    fontFamily: 'Open Sans',
    marginBottom: 30
  },

  loginSubtitleVoltar:{
    color: 'gray',
    fontFamily: 'Open Sans',
    marginTop: 30,
    fontSize: 18,
    textDecorationLine: 'underline'
  },

  viewSubtitle:{
    justifyContent: 'center',
   
  },

  formContainer:{
    padding: 30,
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
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
  },

  viewNewUser:{
    flexDirection: 'row',
    justifyContent: 'center',
  },
  
  textRegister:{
    color: 'gray',
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
    marginLeft: 5, 
    fontSize: 11,
    marginTop: 3, 
    fontWeight: '400', 
    fontFamily: 'Open Sans' 
  }
})























