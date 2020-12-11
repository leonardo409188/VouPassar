import React from 'react'
import firebase from 'react-native-firebase'
import Dialog from "react-native-dialog";

import { 
      StyleSheet, 
      View, 
      Dimensions,
    } from 'react-native'

import { 
      Item,
      Input, 
      Label ,
      Button,
      Text,
      Icon,
      } from 'native-base';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default class Login extends React.Component {
  state = { password: null, newEmail: null, errorMessage: null, dialogVisible: false, msgModal: null }
  
  //Altera senha de usuário
  alterarEmail = () => {
    const { password, newEmail } = this.state
    var user = firebase.auth().currentUser;

    if(password == '' || password == null || newEmail == '' || newEmail == null){
        this.setState({msgModal : "Favor preencha todos os campos."})
            this.showDialog();
    }else{
        var email = user.email
        var credentials = firebase.auth.EmailAuthProvider.credential(
        email,
        password
    );

    
    //Senha antiga é necessária para reautenticar (reauthenticateWithCredentia)
    user.reauthenticateWithCredential(credentials).then(() => {
        if (email == newEmail){
            this.setState({msgModal : "O E-mail atual e novo são podem ser iguais."})
            this.showDialog();
        }else{
        user.updateEmail(newEmail).then(() => {
            this.setState({msgModal : "E-mail alterado com sucesso"})
            this.showDialog();
        }).catch((error) =>{
            if (error.code == 'auth/email-already-in-use')
                this.setState({msgModal : "Este e-mail ja está em uso."})
                this.showDialog();
            });
        } //fim do segundo else
    }).catch((error) => {
        if (error.code == 'auth/wrong-password')
            this.setState({msgModal : "Senha incorreta."})
            this.showDialog();
        });
        } //fim do primeiro else
    }  //fim função alterarSenha


    showDialog = () => {
        this.setState({ dialogVisible: true });
    };
    
    handleCancel = () => {
        this.setState({ dialogVisible: false });
    };

  render() {
    return (
      <View style={styles.container} >
        <View style={styles.login}>
            <Text style={styles.loginTitle}><Icon type="FontAwesome" name="envelope" style={{color: '#fff'}}/> Alterar E-mail</Text>
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
             <Item style={{ borderBottomColor: 'gray', marginBottom: 5 }} floatingLabel>
                <Label style={styles.imputLabel}>Digite o novo E-mail</Label>
                <Input onChangeText={newEmail => this.setState({ newEmail })}
                       style={{color: 'gray'}}
                       value={this.state.newEmail} />
              </Item>
            
              <Item style={{ borderBottomColor: 'gray', marginTop: 10 }} floatingLabel>
                <Label style={styles.imputLabel}>Confirme sua Senha</Label>
                <Input onChangeText={password => this.setState({ password })}
                       style={{color: 'gray'}}
                       secureTextEntry
                       value={this.state.password} />
              </Item>

              <Button style={styles.buttonLogin}     
                      onPress={this.alterarEmail}>
                <Text style={{textAlign: 'center'}}>Alterar E-mail</Text>
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
    alignItems: 'center',
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





















