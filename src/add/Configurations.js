import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, Image, Switch, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import firebase from 'react-native-firebase'
import Dialog from "react-native-dialog";
import Modal from 'react-native-modalbox';
import FilePickerManager from 'react-native-file-picker';
import NetInfo from "@react-native-community/netinfo";
import FBSDK, {LoginManager, AccessToken} from 'react-native-fbsdk'


import { Input, Label, Item, Button, ListItem, Text, Icon, Left, Body, Right } from 'native-base';


const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

export default class HelloWorldApp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            email: '',
            displayName: '',
            uid: null,
            password: null,
            dialogVisible: false,
            dialogVisible1: false,
            dialogVisible2: false,
            confirmLogoff: false,
            msgModal: '',
            imageProfile: null,
            notifications: null,
            textAlterarImagem: 'Alterar Imagem',
            verifica: '',
            isLoading: false,
            isLoadingImagem: false,
            isConnected: false
        };
    }

    componentDidMount() {
        this.fireBaseListener = firebase.auth().onAuthStateChanged(user => {
            var verifica = user.providerData[0].providerId
            this.setState({ verifica })
        });

        const { currentUser } = firebase.auth()
        this.setState({ currentUser })
        var email = currentUser.email
        var displayName = currentUser.displayName
        var uid = currentUser.uid

        this.setState({ email })
        this.setState({ displayName })
        this.setState({ uid })

        firebase.database().ref('/usuarios/' + uid).on('value', (snapshot) => {
            if (snapshot.val() == null) {

            } else {
                var imageProfile = snapshot.val().imageProfile;
                var notifications = snapshot.val().notifications;
                this.setState({ imageProfile })
                this.setState({ notifications })
            }
        });

        const unsubscribe = NetInfo.addEventListener(state => {
            this.setState({isConnected: state.isConnected})
        });

    } // fim DidMount

    // remove o listner do usuário
    componentWillUnmount() {
        NetInfo.removeEventListener(this.unsubscribe)
        this.fireBaseListener && this.fireBaseListener();
        this.authListener = undefined;
    }

    // faz logoff na conta  
    logoff = () => {
        firebase.auth().signOut().then(() => {
            this.props.navigation.navigate('Loading')
            this.setState({ confirmLogoff: false })
        }).catch(function (error) {
            // An error happened.
        });
    }

    // Switch button
    toggleSwitch = value => {
        this.setState({ notifications: value })
        firebase.database().ref('usuarios/' + this.state.uid).update({ //Atualiza o valor "notifications"
            'notifications': value
        })
    };

    //Abre modal
    showDialog = () => {
        this.setState({ dialogVisible: true, password: null });
    };

    //Fecha modal
    handleCancel = () => {
        this.setState({ dialogVisible: false });
    };

    //Abre modal 1
    showDialog1 = () => {
        this.setState({ dialogVisible1: true });
    };

    //Fecha modal 1
    handleCancel1 = () => {
        this.setState({ dialogVisible1: false });
    };

    //Abre modal 2
    showDialog2 = () => {
        this.setState({ dialogVisible2: true });
    };

    //Fecha modal 2
    handleCancel2 = () => {
        this.setState({ dialogVisible2: false });
    };

    //Abre modal 2
    showDialogconfirmLogoff = () => {
        this.setState({ confirmLogoff: true });
    };

    //Fecha modal 2
    handleCancelconfirmLogoff = () => {
        this.setState({ confirmLogoff: false });
    };

    deletarConta = () => {
        var user = firebase.auth().currentUser;

        if(this.state.verifica == 'facebook.com'){
            this.setState({ isLoading: true })
            AccessToken.getCurrentAccessToken().then((accessTokenData) => {
            const credential = firebase.auth.FacebookAuthProvider.credential(accessTokenData.accessToken)
            user.reauthenticateWithCredential(credential).then(()=>{
                user.delete().then(() => {
                    firebase.database().ref('usuarios/' + (this.state.uid)).remove().then(() => {
                        this.props.navigation.navigate('Loading')
                    })
                 })
                }).catch((error)=>{
                    this.setState({ msgModal: "Ocorreu algum erro, tente novamente mais tarde.", isLoading: false })
                    this.refs.modal2.open();
                })
            })
        }
        else{
            this.setState({ isLoading: true })
            const { password, msgModal } = this.state

            if (password == '' || password == null) {
                this.setState({ msgModal: "Favor confirme sua senha.", isLoading: false })
                this.refs.modal2.open();
            } else {
                var credentials = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    password
            );

            //Senha é necessária para reautenticar (reauthenticateWithCredentia)
            user.reauthenticateWithCredential(credentials).then(() => {
                if (password == '' || password == null) {
                    this.setState({ msgModal: "Favor preencher os campos.", isLoading: false })
                    this.refs.modal2.open();
                } else {
                    user.delete().then(() => {
                        firebase.database().ref('usuarios/' + (this.state.uid)).remove().then(() => {
                            this.props.navigation.navigate('Loading')
                        })
                    }).catch((error) => {
                        if (error.code == 'auth/weak-password') {
                            this.setState({ msgModal: "Senha precisa ter 6 ou mais caracteres!", isLoading: false })
                            this.refs.modal2.open();
                        } else {
                            this.setState({ msgModal: "Ocorreu algum erro, tente novamente mais tarde.", isLoading: false })
                            this.refs.modal2.open();
                        }
                    });
                } //fim do segundo else
            }).catch((error) => {
                if (error.code == 'auth/wrong-password') {
                    this.setState({ msgModal: "Senha incorreta.", isLoading: false })
                    this.refs.modal2.open();
                }
                else {
                    this.setState({ msgModal: "Ocorreu algum erro, tente novamente mais tarde.", isLoading: false })
                    this.refs.modal2.open();
                }
            });
        } //fim do primeiro else
        }
    }  //fim função alterarSenha

    onChooseImagePress = async () => {
        var uid = this.state.uid
        var isConnected = this.state.isConnected
        FilePickerManager.showFilePicker(null, (response) => {
            if (response.didCancel) {
                console.log('User cancelled file picker');
            }
            else if (response.error) {
                console.log('FilePickerManager Error: ', response.error);
            }
            else {
                if(isConnected == false){
                    this.refs.modal1.open();
                  }else{
                    this.setState({ isLoadingImagem: true })
                    this.uploadImage(response.path, response.fileName, uid).then((URL) => {
                        firebase.database().ref('usuarios/' + this.state.uid).update({
                            'imageProfile': URL
                        }).then(() => {
                            this.setState({ isLoadingImagem: false })
                        })
                    }).catch((error) => {
                        console.log(error.message);
                    });
                }
            }
        });
    }

    uploadImage = async (uri, imageName, uid) => {
        return new Promise((resolve, reject) => {
            // require the module

            var ref = firebase.storage().ref('/' + uid + '/Imagem_Perfil/' + imageName);
            ref.put(uri).then(function (snapshot) {
                resolve(snapshot['downloadURL'])
            });
        })
    }

    render() {
        return (
            <View style={styles.view}>
                <View style={styles.viewAvatar}>
                    <TouchableOpacity onPress={this.onChooseImagePress}  >
                        {this.state.isLoadingImagem == true ?
                            <View style={styles.imageLoading}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                            :
                            <Image  style={styles.image} source={{ uri: this.state.imageProfile }}></Image>
                        }
                    </TouchableOpacity>

                    <View styles={styles.viewTexts}>
                        <Text style={styles.nameUser}>{this.state.displayName}</Text>
                        <Text style={styles.nameUser}>{this.state.email}</Text>
                    </View>
                </View>

                <ScrollView style={{ padding: 15 }}>
                    <Text style={{ color: 'gray', fontSize: 14, marginBottom: 3, fontWeight: 'bold', marginLeft: 5 }}>Informações</Text>
                    <View style={styles.viewSettings}>

                        {/* //lista alterar Nome  */}
                        <ListItem icon>
                            <Left>
                                <Button style={{ backgroundColor: "#2aac62" }}>
                                    <Icon active name="person" />
                                </Button>
                            </Left>
                            <Body style={styles.withoutBorder}>
                                <Text style={styles.titulo} onPress={() => this.props.navigation.navigate('ChangeName')}>Alterar Nome</Text>
                            </Body>
                            <Right style={styles.withoutBorder}>
                                <Icon name="arrow-forward" />
                            </Right>
                        </ListItem>

                        {/* //lista alterar Senha (se for logado com facebook, não mostra isso )    */}
                        {this.state.verifica == 'facebook.com' ?
                            <View></View>

                            :
                            <View>
                                <ListItem style={{ marginTop: 10 }} icon>
                                    <Left>
                                        <Button style={{ backgroundColor: "#FF9501" }}>
                                            <Icon active name="lock" />
                                        </Button>
                                    </Left>
                                    <Body style={styles.withoutBorder}>
                                        <Text style={styles.titulo} onPress={() => this.props.navigation.navigate('ChangePassword')}>Alterar Senha</Text>
                                    </Body>
                                    <Right style={styles.withoutBorder}>
                                        <Icon name="arrow-forward" />
                                    </Right>
                                </ListItem>

                                {/* //lista alterar email    */}
                                <ListItem style={{ marginTop: 10 }} icon>
                                    <Left>
                                        <Button style={{ backgroundColor: "#3f51b5" }}>
                                            <Icon active name="mail" />
                                        </Button>
                                    </Left>
                                    <Body style={styles.withoutBorder}>
                                        <Text style={styles.titulo} onPress={() => this.props.navigation.navigate('ChangeEmail')}>Alterar E-mail</Text>
                                    </Body>
                                    <Right style={styles.withoutBorder}>
                                        <Icon name="arrow-forward" />
                                    </Right>
                                </ListItem>
                            </View>
                        }
                    </View>

                    <Text style={{ color: 'gray', fontSize: 14, marginTop: 20, marginBottom: 3, fontWeight: 'bold', marginLeft: 5 }}>Conta</Text>
                    <View style={styles.viewSettings}>
                        {/* //lista  notificações  */}
                        <ListItem icon>
                            <Left>
                                <Button style={{ backgroundColor: "purple" }}>
                                    <Icon name="ios-notifications" />
                                </Button>
                            </Left>
                            <Body style={styles.withoutBorder}>
                                <Text style={styles.titulo}>Notificações</Text>
                            </Body>
                            <Switch
                                style={{ right: 0, position: 'absolute' }}
                                onValueChange={this.toggleSwitch}
                                value={this.state.notifications}
                            />
                        </ListItem>

                        {/* //lista deletar usuário    */}
                        <ListItem style={{ marginTop: 10, border: 'none' }} icon>
                            <Left>
                                <Button style={{ backgroundColor: "#fe3939" }}>
                                    <Icon active name="pint" />
                                </Button>
                            </Left>
                            <Body style={styles.withoutBorder}>
                                <Text style={styles.titulo} onPress={() => this.refs.modal4.open()}>Deletar Usuário</Text>
                            </Body>
                            <Right style={styles.withoutBorder}>
                                <Icon name="arrow-forward" />
                            </Right>
                        </ListItem>

                        {/* //lista sair da conta   */}

                        <ListItem style={{ marginTop: 10, border: 'none' }} icon>
                            <Left>
                                <Button style={{ backgroundColor: "#3f51b5" }}>
                                    <Icon active name="arrow-forward" />
                                </Button>
                            </Left>
                            <Body style={styles.withoutBorder}>
                                <Text style={styles.titulo} onPress={() => this.refs.modal3.open()}>Sair da Conta</Text>
                            </Body>
                            <Right style={styles.withoutBorder}>
                                <Icon name="arrow-forward" />
                            </Right>
                        </ListItem>
                    </View>
                </ScrollView>

                {/* MODAL PARA EXCLUIR A CONTA */}
                <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal4]} position={"center"} ref={"modal4"} isDisabled={this.state.isDisabled}>
                    <View style={{ alignItems: "center" }}>
                        <Dialog.Title style={{ color: '#fe3939' }}>Atenção!!</Dialog.Title>
                        <Dialog.Description style={{ textAlign: 'center', color: 'gray' }}>
                            Ao deletar a conta todos os{'\n'}seus dados serão excluidos.
                        </Dialog.Description>
                    </View>
                    {this.state.verifica == 'facebook.com' ?
                        <View></View>
                    :
                        <Item style={{ borderBottomColor: 'gray', marginBottom: 15, marginTop: 15 }} floatingLabel>
                            <Label style={{ color: 'gray' }}>Confirme sua senha</Label>
                            <Input onChangeText={password => this.setState({ password })}
                                secureTextEntry
                                style={{ color: 'gray' }}
                                value={this.state.password} />
                        </Item>
                    }
                    <View style={{ alignItems: 'center', marginTop: 30, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                        <Button onPress={() => this.refs.modal4.close()} small style={{ backgroundColor: 'steelblue' }}>
                            <Text>Cancelar</Text>
                        </Button>
                        <Button onPress={this.deletarConta} small style={{ backgroundColor: '#fe3939', marginLeft: 20 }}>
                            {!this.state.isLoading ?
                                <Text >Deletar</Text>
                                :
                                <ActivityIndicator style={{ paddingRight: 25, paddingLeft: 25 }} size="small" color="#fff" />
                            }
                        </Button>
                    </View>
                </Modal>


                {/*  MODAL DE CONFIRMAÇÃO E LOGOFF */}
                <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal4]} position={"center"} ref={"modal3"} isDisabled={this.state.isDisabled}>
                    <View style={{ alignItems: 'center'}}>
                           <Text style={{color: 'gray', textAlign: 'center', fontSize: 18}}>Tem certeza que deseja{'\n'}sair da conta?</Text>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 40, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                        <Button  onPress={() => this.refs.modal3.close()} small style={{ backgroundColor: 'steelblue' }}>
                            <Text>Cancelar</Text>
                        </Button>
                        <Button onPress={this.logoff} small style={{ backgroundColor: '#fe3939', marginLeft: 20 }}>
                            <Text >Sair</Text>
                        </Button>
                    </View>
                </Modal>


                 {/* -------- Modald de Erros --------------   */}
                 <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal4]} position={"center"} ref={"modal2"} isDisabled={this.state.isDisabled}>
                    <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center' }}>{this.state.msgModal}</Text>
                    <Button style={{fontSize: 12}} onPress={() => this.refs.modal2.close()} small style={{ backgroundColor: 'steelblue', marginTop: 20}}>
                        <Text>Ok, entendi</Text>
                    </Button>
                </Modal>

                {/* -------- Modal Erro Upload --------------   */}
                <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal4]} position={"center"} ref={"modal1"} isDisabled={this.state.isDisabled}>
                    <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center' }}>Não foi possível fazer upload,{'\n'}verifique sua internet.</Text>
                    <Button onPress={() => this.refs.modal1.close()} small style={{ backgroundColor: 'steelblue', marginTop: 20}}>
                        <Text style={{fontSize: 12}} >Ok, entendi</Text>
                    </Button>
                </Modal>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    view: {
        width: width,
        backgroundColor: '#f0f0f0',
        height: height
    },

    viewSettings: {
        padding: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderColor: '#bdc3c7',
        borderWidth: .2
    },

    withoutBorder: {
        borderColor: '#fff'
    },

    viewAvatar: {
        width: '100%',
        height: 100,
        backgroundColor: '#279bce',
        paddingLeft: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },

    viewTexts: {
        marginLeft: 20
    },

    titulo: {
        fontFamily: 'Open Sans',
        fontSize: 16,
        color: 'gray'
    },

    image: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#fff",
        marginRight: 20,
        marginBottom: 5,
        position: 'relative',
        zIndex: 0
    },
    imageLoading: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: "#fff",
        justifyContent: 'center',
        alignContent: 'center',
        marginRight: 20,
        marginBottom: 5,
        position: 'relative',
    },

    nameUser: {
        color: '#fff',
        fontFamily: 'Open Sans',
        fontSize: 16
    },

    modal: {
        justifyContent: 'center',
        alignItems: 'center'
      },
      modal4: {
        height: 'auto',
        minHeight: 100,
        width: '70%',
        padding: 15,
        borderRadius: 5
      },
})