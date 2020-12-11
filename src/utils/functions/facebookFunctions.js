import FBSDK, {LoginManager, AccessToken} from 'react-native-fbsdk'

export const facebookLogin = () => {
    LoginManager.logInWithPermissions(['public_profile', 'email']).then((result) => {
        if (result.isCancelled){
           this.setState({msgModal : "Login Cancelado."})
           this.showDialog();
        }else{
          this.setState({isLoadingFacebook: true})
          AccessToken.getCurrentAccessToken().then((accessTokenData) => {
            const credential = firebase.auth.FacebookAuthProvider.credential(accessTokenData.accessToken)
            firebase.auth().signInWithCredential(credential).then(()=>{ // após login dar sucesso ele verifica se é primeiro login ou não.
               const { currentUser } = firebase.auth()
               var uid = currentUser.uid
               firebase.database().ref('usuarios/').once('value' , (snapshot)=>{
                 if (snapshot.hasChild(uid) === true) {
                   this.props.navigation.navigate('Main')
                 }
                 else{
                   console.log('caiu no 2')
                   this.props.navigation.navigate('PerformanceSettings')
                 }
              })
               
            }, (error) => {
              if(error.code == 'auth/account-exists-with-different-credential'){
               this.setState({msgModal : "O e-mail desta conta já está sendo utilizado.", isLoadingFacebook: false})
               this.showDialog();
              }
            })
          }, (error => {
           this.setState({msgModal : "Ocorreu algum erro. Tente novamente.", isLoadingFacebook: false})
           this.showDialog();
          }))
      }
     }, 
     (error =>{
       if(error.code == 'EUNSPECIFIED'){
         this.setState({msgModal : "Ocorreu algum erro. Verifique sua conexão.", isLoadingFacebook: false})
         this.showDialog();
       }
     })
    );
  }