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
      Label,
      Button,
      Text,
      Icon,
      } from 'native-base';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default class Login extends React.Component {
  state = { oldPassword: null, newPassword: null, errorMessage: null, dialogVisible: false, msgModal: null, isLoading: false }
  
  //Altera senha de usuário
  alterarSenha = () => {
    const { oldPassword, newPassword, msgModal } = this.state
    var user = firebase.auth().currentUser;

    if(oldPassword == '' || oldPassword == null ){
        this.setState({msgModal : "Favor preencher os campos"})
            this.showDialog();
    }else{
        this.setState({isLoading: true})
        var credentials = firebase.auth.EmailAuthProvider.credential(
        user.email,
        oldPassword
    );
    
    //Senha antiga é necessária para reautenticar (reauthenticateWithCredentia)
    user.reauthenticateWithCredential(credentials).then(() => {
        if (newPassword == '' || newPassword == null) {
            this.setState({isLoading: false})
            this.setState({msgModal : "Favor preencher os campos"})
            this.showDialog();
        }else {
        user.updatePassword(newPassword).then(() => {
            this.setState({isLoading: false, oldPassword: null, newPassword: null, msgModal : "Senha alterada com sucesso!"})
            this.showDialog();
        }).catch((error) =>{
            this.setState({isLoading: false})
            if (error.code == 'auth/weak-password')
              this.setState({msgModal : "Senha precisa ter 6 ou mais caracteres!"})
              this.showDialog();
            });
        } //fim do segundo else
    }).catch(() => {
          this.setState({isLoading: false})
          this.setState({msgModal : "Senha atual incorreta!"})
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
            <Text style={styles.loginTitle}><Icon type="FontAwesome" name="lock" style={{color: '#fff'}}/> Alterar a Senha</Text>
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
                <Label style={styles.imputLabel}>Digite a senha atual</Label>
                <Input onChangeText={oldPassword => this.setState({ oldPassword })}
                       style={{color: 'gray'}}
                       secureTextEntry
                       value={this.state.oldPassword} />
              </Item>
            
              <Item style={{ borderBottomColor: 'gray', marginTop: 10, marginBottom: 15 }} floatingLabel >
                <Label style={styles.imputLabel}>Digite a nova Senha</Label>
                <Input onChangeText={newPassword => this.setState({ newPassword })}
                       style={{color: 'gray'}}
                       secureTextEntry
                       value={this.state.newPassword} />
              </Item>

              <Button style={styles.buttonLogin}     
                      onPress={this.alterarSenha}>
                {!this.state.isLoading ?     
                <Text style={{textAlign: 'center'}}> Alterar Senha</Text>
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





















