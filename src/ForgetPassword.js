import React from 'react'
import firebase from 'react-native-firebase'
import Dialog from "react-native-dialog"

import {
  StyleSheet,
  View,
  ActivityIndicator,
  Dimensions
} from 'react-native'

import {
  Item,
  Input,
  Label,
  Button,
  Text,
  Icon
} from 'native-base';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      errorMessage: null,
      isLoading: false,
      dialogVisible: false,
      msgModal: null
    };
  }

  //Abre modal
  showDialog = () => {
    this.setState({ dialogVisible: true });
  };

  //Fecha modal
  handleCancel = () => {
    this.setState({ dialogVisible: false });
  };

  //
  recuperaSenha = () => {
    var auth = firebase.auth();
    var emailAddress = this.state.email;

    this.setState({ isLoading: true })

    if (emailAddress != null && emailAddress != '' && emailAddress.includes("@") == true && emailAddress.includes(".com") == true) {
      auth.sendPasswordResetEmail(emailAddress).then(() => {
        this.setState({ msgModal: "E-mail Enviado!" })
        this.setState({ isLoading: false })
        this.showDialog();
      }).catch((error) => {
        if (error.code == "auth/user-not-found") {
          this.setState({ msgModal: "Este e-mail não está cadastrado!" })
          this.setState({ isLoading: false })
          this.showDialog();
        }else{
          this.setState({ msgModal: "Ocorreu algum erro, tente novamente mais tarde." })
          this.setState({ isLoading: false })
          this.showDialog();
        }
      });
    } else {
      this.setState({ msgModal: "Favor inserir um e-email válido" })
      this.setState({ isLoading: false })
      this.showDialog();
    }
  }

  render() {
    return (
      <View style={styles.container} >
        <View style={styles.login}>
          <Text style={styles.loginTitle}><Icon type="FontAwesome" name="lock" style={{ color: '#fff' }} /> Recuperar Senha</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.viewSubtitle}>
            <Text style={styles.loginSubtitle}>Enviaremos um e-mail para a recuperação da senha</Text>
          </View>
          <Item style={{ borderBottomColor: 'gray' }} floatingLabel style={styles.itemImput}>
            <Label style={styles.imputLabel}>E-mail</Label>
            <Input onChangeText={email => this.setState({ email })}
              style={{ color: 'gray' }}
              value={this.state.email} />
          </Item>
          <Text style={styles.errorText}>
            {this.state.error}
            {this.state.errorMessage}
          </Text>

          <Button style={styles.buttonLogin}
            onPress={this.recuperaSenha}>
            {!this.state.isLoading ?
              <Text style={{ textAlign: 'center' }}> Recuperar Senha</Text>
              :
              <ActivityIndicator size="small" color="#fff" />
            }
          </Button>
        </View>
        <Text style={styles.loginSubtitleVoltar}
          onPress={() => this.props.navigation.navigate('Login')}>Voltar</Text>

        {/* MODAL DOS ALERTAS */}
        <Dialog.Container visible={this.state.dialogVisible}>
          <View style={{ alignItems: 'center', marginTop: -25 }}>
            <Dialog.Description>
              {this.state.msgModal}
            </Dialog.Description>
          </View>
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Button small style={{ backgroundColor: 'steelblue' }}>
              <Text onPress={this.handleCancel}>Ok, entendi</Text>
            </Button>
          </View>
        </Dialog.Container>
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
  },

  loginTitle: {
    color: '#fff',
    fontFamily: 'OpenSans',
    fontSize: 30,
    fontWeight: "400",
    textAlign: 'center',
    marginTop: 30
  },

  loginSubtitle: {
    color: 'gray',
    fontFamily: 'Open Sans',
    marginBottom: 30,
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

  formContainer: {
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

  buttonLogin: {
    marginTop: 15,
    marginBottom: 15,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
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





















