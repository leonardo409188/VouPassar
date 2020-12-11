import React, { Component } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert, TextInput , Linking } from 'react-native';
import { Icon, Content, Text, Input, DatePicker, Item, Button, Picker } from 'native-base';
import moment from 'moment'
import ActionButton from 'react-native-action-button';
import FilePickerManager from 'react-native-file-picker';
import Modal from 'react-native-modalbox';
import NetInfo from "@react-native-community/netinfo";
import * as firebase from 'react-native-firebase';
import { getUser, getCurrentDate, uploadFile, newContent, deleteContent, deleteFile, deleteSubjectAndContents } from '../../utils/functions'
import { labels, messages, config, routeNames } from '../../utils/constants'


const width = Dimensions.get('screen').width;

export default class Contents extends Component {
  constructor(props) {
    super(props);

    this.state = {
      conteudos: [],
      documentos: [],
      isLoading: false,
      novoConteudo: '',
      currentDate: '',
      chosenDate: '',
      nomeConteudo: '',
      nomeDisciplina: '',
      error: false,
      errorArquivo: false,
      tipo: 'tarefa',
      titleButton: 'Anexar arquivo...',
      showing: 'aFazer',
      isConnected: false,
      backButtonCount: 0
    };
    this.setDate = this.setDate.bind(this);
  }

  componentDidMount() {
    const user = getUser();
    const { uid } = user;
    
    const currentDate = getCurrentDate(true);

    const keyDisciplina = this.props.navigation.getParam('key');
    const nomeDisciplina = this.props.navigation.getParam('name');
    const color = this.props.navigation.getParam('color');

    this.setState({ uid, keyDisciplina, nomeDisciplina, color, currentDate, chosenDate: currentDate }, () => {
      this.getContents();
    });

    var unsubscribe = NetInfo.addEventListener(state => {
      this.setState({ isConnected: state.isConnected });
    });
  }

   //remove o listener do netInfo
  componentWillUnmount() {
    NetInfo.removeEventListener(this.unsubscribe);
  } 

  // Lista TODOS OS CONTEUDOS que essa disciplina tem
  getContents() {
    const { showing, uid, keyDisciplina } = this.state;

    firebase.database().ref('usuarios/' + uid + '/conteudos/' + keyDisciplina).orderByChild("status").equalTo(showing).on('value', (snapshot) => {
      const conteudos = [];
      var count = 0

      if (snapshot.val() === null) {
        this.setState({ conteudos: null, count: 0 });
      }

      snapshot.forEach((doc) => {
        const { nomeConteudo, data, status, tempoTarefa, keyHoje } = doc.toJSON();
        const keys = JSON.stringify(doc.key).slice(1, -1);
        const myMoment = moment(data, 'DD-MM-YYYY');
       
        if (moment(myMoment).isBefore(new Date(), "day") && showing === 'aFazer') {// Se estiver atrasada
          var dataFormatada = <View style={{ flexDirection: 'row' }}>
                                <Text style={styles.dataFormatada}>
                                  {moment(myMoment).format('DD/MMM/YY', 'pt-BR')}
                                </Text>
                                <Text style={{ color: 'rgba(231,76,60,.8)', fontSize: 14, fontWeight: 'bold' }}> {labels.late} </Text>
                              </View>;
        } else { // se não tiver atrasada
          var dataFormatada = <Text style={styles.dataFormatada}>
                                {moment(myMoment).format('DD/MMM/YY', 'pt-BR')}
                              </Text>
        }
        count++
        conteudos.push({
          key: doc.key,
          conteudos: nomeConteudo, keys, data, keyHoje, dataFormatada, status, tempoTarefa
        });
        this.setState({ conteudos, count })
      })
    });
  }

  changeFilter(itemValue) {
    this.setState({ showing: itemValue }, () => {
      this.getContents();
    })   
  }

  setDate(newDate) {
    var chosenDate = moment(newDate).format('DD-MM-YYYY');
    this.setState({ chosenDate });
  }
  
  onChooseImagePress = async () => {
    const { uid, isConnected } = this.state;

    FilePickerManager.showFilePicker(null, (response) => {
      if (response.didCancel) {
        console.log('User cancelled file picker');
      }
      else if (response.error) {
        console.log('FilePickerManager Error: ', response.error);
      }
      else {
        if (!isConnected) {
          this.refs.modal4.open();
        } else {
        this.setState({ titleButton: 'Carregando...', errorArquivo: false }, () => {
          uploadFile(response.path, response.fileName, uid)
          .then((URL) => {
            this.setState({ URL, titleButton: response.fileName, nomeArquivo: response.fileName });
          })
          .catch((error) => {
            Alert.alert(error.message);
            });
          })
        }
      }
    });
  }

  // Adiciona um CONTEUDO na disciplina 
  addNewContent = () => {
    const { URL, novoConteudo, tipo, uid, keyDisciplina, chosenDate, novoConteudo, nomeDisciplina, anotacoes, nomeArquivo } = this.state;

    const haveDocument
    URL === null ? haveDocument = false : haveDocument = true;

    if (novoConteudo === '' && tipo !== 'arquivo') {
      this.setState({ error: true });
    } else if (tipo === 'arquivo' && URL === null) {
      this.setState({ errorArquivo: true, titleButton: 'Insira algum anexo.' });
    }
    else {
      newContent(URL, novoConteudo, tipo, uid, keyDisciplina, chosenDate, novoConteudo, nomeDisciplina, haveDocument, anotacoes, nomeArquivo);
      this.setState({ titleButton: 'Anexar arquivo...',  novoConteudo: '' }, () => {
        this.refs.modal3.close();
      });  
    }
  }

  //Deleta a DISCIPLINA e todos os seus CONTEUDOS
  deleteSubject = (keyDisciplina) => {
    const { uid } = this.state;

    deleteSubjectAndContents(uid, keyDisciplina);
    this.props.navigation.navigate('Atividades');
  }

  // Lista os arquivos da Disciplina
  getFiles = () => {
    const { uid, keyDisciplina } = this.state;

    firebase.database().ref('usuarios/' + uid + '/conteudos/' + keyDisciplina).orderByChild('temDocumento').equalTo(true).on('value', (snapshot) => {
      if (snapshot.val() === null) {
        this.setState({ documentos: null })
      } else {
        const documentos = [];
        
        snapshot.forEach((doc) => {
          const { tipo, nomeConteudo } = doc.toJSON();
          const url = doc.toJSON().urlDocumento
          const nome = doc.toJSON().nomeArquivo

          documentos.push({
            key: doc.key,
            documentos: url, url, nome, tipo, nomeConteudo
          });
          this.setState({ documentos }, () => {
            this.refs.modal1.open();
          })
        })
      } 
    })
  }

  closeModal = () => {
    this.refs.modal3.close();
    this.setState({ novoConteudo: '', titleButton: 'Anexar arquivo...', errorArquivo: false, error: false });
  }

  // Abre a URL dos arquivos para download 
  openFile = (url) => {
    Linking.openURL(url);
  };

  // Deleta um CONTEUDO recebendo a key, data e keyHoje
  deleteContentModal = (keyConteudo, data, keyHoje) => {
    Alert.alert(
      labels.deleteContent,
      messages.deleteContent,
      [
        { text: 'Cancelar', onPress: () => console.log('teste'), style: 'cancel' },
        {
          text: 'Deletar', onPress: () =>
            deleteContent(this.state.uid, this.state.keyDisciplina, keyConteudo, data, keyHoje)
        },
      ]
    );
  }

  deleteFileModal = (keyConteudo, nomeArquivo) => {
    Alert.alert(
      labels.deleteFile,
      messages.deleteFile,
      [
        { text: 'Cancelar', onPress: () => console.log('teste'), style: 'cancel' },
        {
          text: 'Deletar', onPress: () =>
            deleteFile(this.state.uid, this.state.keyDisciplina, keyConteudo, nomeArquivo)
        },
      ]
    );
  }


  render() {
    const { count, documentos, showing, conteudos, keyDisciplina, nomeDisciplina, color, tipo, 
          error, currentDate, errorArquivo, titleButton, novoConteudo, anotacoes } = this.state;

    let countView;
    let flatlistDocumentos;

    if (count >= 1) {
      countView = <Text style={styles.countContents}> {count === 1 ? labels.oneContent : `(${count + labels.moreContents})`} </Text>
    } else {
      countView = <Text style={styles.countContents}> {labels.withoutContent} </Text>
    }

    if (documentos === null) {
      flatlistDocumentos = <Text style={{ marginTop: 30, marginBottom: 20, fontSize: 16, textAlign: 'center' }}> {messages.withoutFiles} </Text>
    } else {
      flatlistDocumentos = <FlatList style={{ maxHeight: 200, height: 'auto', paddingTop: 8, paddingBottom: 0 }}
        data={documentos}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity style={{ width: '100%', alignContent: 'flex-start' }} onPress={this.openFile.bind(this, (item.url))}>
              <View style={styles.viewFiles}>
                <View style={{flexDirection: 'column'}}>
                  {item.tipo === config.file
                  ?
                    <View/>
                  :
                    <Text style={{color: 'gray', fontSize: 16, fontWeight: 'bold'}}>{item.nomeConteudo}:</Text>
                  }

                  <Text style={{color: 'steelblue', fontSize: 13, maxWidth: '95%'}}>( {item.nome} )</Text>
                </View>

                {item.tipo === config.file
                ?
                  <Icon name="md-trash" style={styles.deleteIcon}
                    onPress={this.deleteFileModal.bind(this, item.key, item.nome)} />
                :
                  <View></View>
                }

              </View>
            </TouchableOpacity>
          )
        }}
        keyExtractor={item => item.key}
      >
      </FlatList>
    }

    return (
      <View style={{ alignItems: "center", backgroundColor: '#f0f0f0', height: '100%' }}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'column', flex: 2 }}>
            <Text style={styles.headerName}> {(this.props.navigation.getParam("name"))} </Text>
            {countView}
          </View>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            <Text style={{ color: 'gray', fontWeight: 'bold', marginLeft: 7, fontSize: 14 }}> {labels.showing} </Text>
            <Picker
              selectedValue={showing}
              style={{ width: 135, position: 'absolute', color: 'gray', marginTop: 3 }}
              onValueChange={(itemValue, itemIndex) =>
                this.changeFilter(itemValue)
              }>
              <Picker.Item label="A Fazer" value="aFazer" />
              <Picker.Item label="Iniciadas" value="Iniciado" />
              <Picker.Item label="Concluídas" value="Concluido" />
            </Picker>
          </View>
        </View>


        <FlatList style={{ paddingRight: 10, paddingBottom: 0, paddingLeft: 10, paddingTop: 10 }}
          data={conteudos}
          renderItem={({ item, index }) => {
            return (
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity style={styles.viewDisciplinas}
                  onPress={() => {
                    this.props.navigation.navigate(routeNames.DetailsActivities, {
                      keyConteudo: item.keys,
                      keyDisciplina: keyDisciplina,
                      nomeConteudo: item.conteudos,
                      nomeDisciplina: nomeDisciplina,
                      color: color
                    });
                  }} >
                  <View style={{ flexDirection: 'column' }}>
                    <Text style={{ color: '#14447b', fontWeight: "bold", fontSize: 14 }}>{item.conteudos}</Text>
                    {item.dataFormatada}
                  </View>

                  {item.status === config.concluded 
                  ?
                    <View style={{ position: 'absolute', right: 15, alignItems: 'center' }}>
                      <Icon type="FontAwesome" name="check-circle" style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }} />
                      <Text style={{ color: 'gray' }}>{item.tempoTarefa}</Text>
                    </View>
                  :
                    <View style={{ position: 'absolute', right: 5, width: 30 }}>
                      <Icon name="md-trash" style={{ color: 'rgba(231,76,60,1)', fontSize: 30, }}
                        onPress={this.deleteContentModal.bind(this, item.key, item.data, item.keyHoje)}
                      />
                    </View>
                  }
                </TouchableOpacity>

              </View>
            )
          }}
          keyExtractor={item => item.key}
        >

        </FlatList>

        <ActionButton
          size={55}
          offsetX={20} offsetY={20}
          renderIcon={active => active ? (<Icon name="md-arrow-back" style={{ color: '#fff' }} />) : (<Icon name="ios-arrow-back" style={{ color: '#fff' }} />)}
          position="left"
          buttonColor="gray"
          onPress={() => {
            this.props.navigation.navigate(routeNames.Subjects)
          }}
        >
        </ActionButton>

        {/* Rest of the app comes ABOVE the action button component !*/}
        <ActionButton size={55} spacing={10} buttonColor="#279bce" offsetX={20} offsetY={20}>
          <ActionButton.Item spaceBetween={8} size={40} buttonColor='#9b59b6' title="Arquivos" onPress={this.getFiles}>
            <Icon name="ios-attach" style={{ color: '#fff' }} />
          </ActionButton.Item>
          <ActionButton.Item spaceBetween={8} size={40} buttonColor='rgba(231,76,60,1)' title="Deletar Disciplina" onPress={() => this.refs.modal2.open()}>
            <Icon name="md-trash" style={{ color: '#fff' }} />
          </ActionButton.Item>
          <ActionButton.Item spaceBetween={8} size={40} buttonColor='#1abc9c' title="Adicionar" onPress={() => this.refs.modal3.open()} >
            <Icon name="ios-add" style={{ color: '#fff' }} />
          </ActionButton.Item>
        </ActionButton>


        {/* ---------------------INICIO DOS MODAISSSSSS ---------------------   */}
        {/* ------------ Modal PARA ADICIONAR NOVO CONTEUDO  ------------   */}
        <Modal backdropPressToClose={false} 
               keyboardTopOffset={0} 
               coverScreen={true} 
               style={[styles.modal, styles.modal3]} 
               position={"center"} ref={"modal3"} isDisabled={false}
        >
          <View style={{ alignItems: 'center', marginBottom: 5 }}>
            <Text style={{ textAlign: 'center', color: 'steelblue', fontSize: 18, fontWeight: 'bold' }}>
              Novo Conteúdo
              </Text>
            <Text style={{ fontSize: 14, color: 'steelblue' }}>({(this.props.navigation.getParam("name"))})</Text>
          </View>

          <View>
            <Item rounded style={{ marginBottom: 15, borderColor: 'gray', paddingLeft: 10, height: 40, marginTop: 20 }}>
              <Picker
                selectedValue={tipo}
                style={{ height: 50, width: '100%', color: 'gray' }}
                onValueChange={(itemValue, itemIndex) =>
                  this.setState({ tipo: itemValue })
                }>
                <Picker.Item label="Tarefa" value="tarefa" />
                <Picker.Item label="Revisão" value="revisao" />
                <Picker.Item label="Arquivo" value="arquivo" />
              </Picker>
            </Item>
          </View>

          {tipo === config.file
          ?
            <View/>
          :
            <View>
              <Item rounded style={error ? styles.error : styles.ok}>
                <Input Textbox placeholder=" Nome do conteúdo" onChangeText={novoConteudo => this.setState({ novoConteudo, error: false })}
                  style={{ color: 'gray' }}
                  placeholderTextColor="gray"
                  value={novoConteudo} />
                {error 
                ?
                  <Icon style={{ color: 'rgba(231,76,60,1)' }} name='close-circle' />
                :
                  <Text/>
                }
              </Item>

              <Item rounded style={{ marginTop: 15, marginBottom: 15, borderColor: 'gray', paddingLeft: 10, height: 40 }}>
                <Icon name="md-calendar" style={{ color: 'gray', fontSize: 22 }} />
                <Content>
                  <DatePicker
                    defaultDate={new Date()}
                    minimumDate={new Date()}   
                    maximumDate={new Date(2040, 12, 31)}
                    timeZoneOffsetInMinutes={undefined}
                    modalTransparent={false}
                    animationType={"fade"}
                    androidMode={"default"}
                    placeHolderText={currentDate}
                    textStyle={{ color: "steelblue" }}
                    placeHolderTextStyle={{ color: "steelblue" }}
                    onDateChange={this.setDate}
                    disabled={false} />
                </Content>
              </Item>
            </View>
          }

          <TouchableOpacity style={{ width: '100%' }} >
            <Button style={errorArquivo == false ? styles.arquivoOk : styles.arquivoError} onPress={this.onChooseImagePress}>
              <Text style={{ fontSize: 12 }}> {titleButton} </Text>
            </Button>
          </TouchableOpacity>

          {tipo === config.file
          ?
            <View/>
          :
            <View style={styles.textAreaContainer} >
              <TextInput
                style={styles.textArea}
                underlineColorAndroid="transparent"
                placeholder="Anotações"
                placeholderTextColor="grey"
                numberOfLines={5}
                multiline={true}
                onChangeText={(text) => this.setState({ anotacoes: text })}
                value={anotacoes}
              />
            </View>
          }

          <View style={{ justifyContent: 'center', flexDirection: "row", marginTop: 15 }}>
            <Button small onPress={() => this.closeModal()} style={{ marginTop: 5, backgroundColor: '#fe3939', padding: 10, opacity: .8 }}>
              <Text style={{ fontSize: 12, textAlign: 'center' }}> {labels.close} </Text>
            </Button>

            {titleButton === config.loading 
            ?
              <View/>
            :
              <Button small onPress={this.addNewContent.bind(this, keyDisciplina)} style={{ marginTop: 5, marginLeft: 15, backgroundColor: 'steelblue', padding: 10 }}>
                <Text style={{ fontSize: 12, textAlign: 'center' }}> {labels.save} </Text>
              </Button>
            }
          </View>
        </Modal>


        {/* ------------ Modal DE CONFIRMAÇÃO PARA DELETAR DISCIPLINA  ------------   */}
        <Modal backdropPressToClose={false} 
               keyboardTopOffset={0} 
               coverScreen={true} 
               style={styles.modal3} 
               position={"center"} ref={"modal2"} isDisabled={false}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ textAlign: 'center', color: 'gray' }}>
              {messages.deleteSubject}
            </Text>
          </View>
          <View style={{ alignItems: 'center', marginTop: 40, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
            <Button small style={{ backgroundColor: 'steelblue' }}>
              <Text onPress={() => this.refs.modal2.close()}> {labels.cancel} </Text>
            </Button>
            <Button small style={{ backgroundColor: '#fe3939', marginLeft: 20 }}>
              <Text onPress={this.deleteSubject.bind(this, keyDisciplina)}> {labels.delete} </Text>
            </Button>
          </View>
        </Modal>


        {/* -------- Modal para listar os arquivos --------------   */}
        <Modal backdropPressToClose={false} 
               keyboardTopOffset={0} 
               coverScreen={true} 
               style={[styles.modal, styles.modal1]} 
               position={"center"} ref={"modal1"} isDisabled={false}
        >
          <Text style={{ color: 'gray', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}><Icon name="ios-attach" style={{ color: 'gray' }} /> {labels.files}</Text>
            {flatlistDocumentos}
          <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 25}}> 
            <Button small onPress={() => this.refs.modal1.close()} style={{ marginTop: 5, backgroundColor: 'steelblue', padding: 10}}>
              <Text style={{ fontSize: 12, textAlign: 'center' }}> {labels.close} </Text>
            </Button>
          </View>
        </Modal>

         {/* -------- Modal Erro Upload --------------   */}
         <Modal backdropPressToClose={false} 
                keyboardTopOffset={0} 
                coverScreen={true} 
                style={[styles.modal, styles.modal4]} 
                position={"center"} ref={"modal4"} isDisabled={false}
          >
           <Text style={{ color: 'gray', fontSize: 16, textAlign: 'center' }}> {messages.uploadError} </Text>
            <View style={{justifyContent: 'center'}}> 
              <Button onPress={() => this.refs.modal4.close()} small style={{ backgroundColor: 'steelblue', marginTop: 20}}>
                <Text style={{fontSize: 12}}> {labels.understand} </Text>
              </Button>
            </View>
          </Modal>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: width,
    padding: 15
  },

  dataFormatada: { 
    color: 'gray', 
    fontSize: 13, 
    fontWeight: 'bold' 
  },

  textAreaContainer: {
    width: '100%',
    marginTop: 15,
    borderColor: 'gray',
    borderWidth: .7,
    padding: 0,
    borderRadius: 10
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
    color: 'gray'
  },

  title: {
    color: '#007791',
    fontFamily: 'Open Sans',
    fontWeight: 'bold'
  },

  viewDisciplinas: {
    backgroundColor: '#fff',
    paddingLeft: 10,
    paddingTop: 5,
    paddingBottom: 5,
    paddingRight: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5,
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    flexDirection: 'row',
    borderColor: '#bdc3c7',
    borderWidth: .2
  },
  ok: {
    width: '100%',
    borderColor: 'gray',
    paddingLeft: 10,
    height: 40
  },
  error: {
    width: '100%',
    borderColor: 'red',
    paddingLeft: 10,
    height: 40,
  },
  arquivoOk: {
    width: '100%',
    backgroundColor: 'steelblue',
    borderRadius: 20,
    height: 40
  },
  arquivoError: {
    width: '100%',
    backgroundColor: 'rgba(231,76,60,1)',
    borderRadius: 20,
    height: 40
  },
  modal1: {
    height: 'auto',
    minHeight: 100,
    width: '90%',
    padding: 15,
    borderRadius: 5,

  },

  modal3: {
    height: 'auto',
    minHeight: 100,
    width: '90%',
    padding: 15,
    borderRadius: 5
  },
  modal: {
    justifyContent: 'center',
   
  },
  modal4: {
    height: 'auto',
    minHeight: 100,
    width: '70%',
    padding: 15,
    borderRadius: 5
  },

  countContents: { 
    color: 'gray', 
    fontSize: 13 
  },

  viewFiles: { 
    marginTop: 10, 
    borderBottomColor: '#f0f0f0', 
    borderBottomWidth: .8, 
    paddingBottom: 8,
    flexDirection: 'row', 
    alignItems: 'center'
  },

  deleteIcon: { 
    color: 'rgba(231,76,60,1)', 
    fontSize: 24, 
    right: 0, 
    position: 'absolute' 
  },

  header: { 
    borderLeftColor: this.state.color, 
    borderLeftWidth: 8, 
    padding: 10, 
    paddingRight: 15, 
    width: width, 
    backgroundColor: '#fff', 
    flexDirection: 'row' 
  },
  headerName: { 
    color: '#000', 
    fontSize: 16, 
    color: 'gray', 
    fontWeight: 'bold' 
  }
})