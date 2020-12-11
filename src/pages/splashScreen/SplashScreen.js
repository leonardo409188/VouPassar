import React from 'react';
import firebase from 'react-native-firebase';
import { View, StyleSheet, Image } from 'react-native';
import { labels, routeNames } from '../../utils/constants';

export default class SplashScreen extends React.Component {

  componentDidMount() {   
    this.checkUser();
  }

  checkUser() {
    setTimeout(() => {
      firebase.auth().onAuthStateChanged(user => {
        if (user !== null) {
          const checkUser = user.providerData[0].providerId;
            
          if (user.emailVerified === false && checkUser !== labels.facebookUrl) {
            this.props.navigation.navigate(routeNames.EmailVerification);  //se o usuário ainda não tiver verificado o email, manda para a tela de verificação
          }
          else if (user.emailVerified === true) {
            this.props.navigation.navigate(routeNames.Home);   // se ja tiver verificado manda pra main
          }
          else if (checkUser === labels.facebookUrl){
            this.props.navigation.navigate(routeNames.Home);    // se for usuário autenticado pelo Facebook manda pra home (não precisa verificar email)
          }
          else {
            this.props.navigation.navigate(routeNames.Login);   // se não tiver usuário logado, manda pro login
          }
        } else {
          this.props.navigation.navigate(routeNames.Login);     // se não tiver usuário logado, manda pro login
        }
      })
    }, 1500);
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.img}
          source={require('../../../assets/img/logo.png')}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#279bce'
  },

  img: {
    width: 180, 
    height: 180, 
    marginBottom: 50
  }
})
