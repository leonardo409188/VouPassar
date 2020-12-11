import React from 'react'
import { StyleSheet, FlatList, View, Dimensions, TouchableOpacity } from 'react-native';
import { Icon, Text, Button, Item, Input } from 'native-base';
import firebase from 'react-native-firebase'
import Modal from 'react-native-modalbox';
import { getUser, getCurrentDate, getRandomColor, createNewSubject, changeNameSubject } from '../../utils/functions'
import { labels, messages, routeNames } from '../../utils/constants';


export default class Subjects extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disciplinas: [],
      currentDate: '',
      nomeDisciplina: '',
      key: [],
      dialogVisible: false,
      count: null,
      error: false,
      nomeEditar: '',
      keyEditar: '',
      salvou: false
    };
  }

  componentDidMount() {
    const user = getUser();
    const currentDate = getCurrentDate(false);
    const { uid, email, displayName } = user;

    this.setState({ uid, email, displayName, currentDate }, () => {
      this.loadSubjects(uid);
    });
  }

  // Lista todas as disciplinas que o usuário tem cadastrado
  loadSubjects = (uid) => {  
     firebase.database().ref().child('usuarios').child(uid).child('disciplinas').on('value', (snapshot) => {
      const disciplinas = [];
      const key = [];
      const count = snapshot.numChildren();

      snapshot.forEach((doc) => {
        const { nomeDisciplina, color } = doc.toJSON();

        disciplinas.push({
          key: doc.key,
          nomeDisciplina,
          color
        });
        this.setState({
          disciplinas: disciplinas.sort((a, b) => {
            return (a.nomeDisciplina < b.nomeDisciplina);
          }), key, count });
      });
    });
  }

  // Adiciona uma Disciplina nova
  newSubject = () => {
    const { uid, nomeDisciplina } = this.state;
    const color = getRandomColor();

    if (nomeDisciplina === '') {
      this.setState({ error: true });
    } else {
      createNewSubject(uid, nomeDisciplina, color);

      this.setState({ nomeDisciplina: '' });
      this.refs.modal3.close();
    }
  }

  // Altera o nome da Disciplina
  changeName = () => {
    const { uid, keyEditar, nomeEditar }  = this.state;

    if (nomeEditar === '') {
      this.setState({ error: true });
    } else {
      this.setState({salvou: true})
      changeNameSubject(uid, keyEditar, nomeEditar);
    }
  }

  // Abre o modal de alteração de nome
  openModalChangeName = (nomeEditar, keyEditar) => {
    this.setState({ nomeEditar, keyEditar}, () => {
      this.refs.RefModalChangeName.open();
    })
  }

  closeModal = () => {
    this.refs.modal3.close();
    this.refs.RefModalChangeName.close();
  }

  render() {

    // conditional render para a flatlist
    const { disciplinas, isDisabled, nomeDisciplina, error, salvou, nomeEditar } = this.state;
    let flatlist;

    if (disciplinas === null || disciplinas === 0) {
      flatlist = <Text style={styles.flatListNone}> {messages.withoutSubjects} {'\n'} {messages.startSubject} </Text>
    } else {
      flatlist = <FlatList
        style={styles.flatListFull}
        data={disciplinas}
        renderItem={({ item, index }) => {
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onLongPress={() => this.openModalChangeName(item.nomeDisciplina, item.key)} style={styles.viewDisciplinas} onPress={() => {
                this.props.navigation.navigate(routeNames.Contents, {
                  key: item.key,
                  name: item.nomeDisciplina,
                  color: item.color
                });
              }}>
                <Text style={{ borderLeftColor: item.color, borderLeftWidth: 10, fontSize: 25 }} />
                  <Text style={styles.nameSubject}>
                    {item.nomeDisciplina}
                  </Text>
                <Icon style={styles.iconArrow} name="arrow-forward" />
              </TouchableOpacity>
            </View>
          )
        }}
        keyExtractor={item => item.key}
      >
      </FlatList>
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{labels.subjects}</Text>
          <TouchableOpacity style={{ flexDirection: 'column', alignItems: "center" }}>
            <Icon type="FontAwesome" name="plus-circle" style={{ color: '#fff', fontSize: 30 }}
              onPress={() => this.refs.modal3.open()}
            />
            <Text style={{ color: '#fff', fontSize: 10 }}> {labels.add} </Text>
          </TouchableOpacity>
        </View>

        {flatlist}

        {/*  MODAL NOVA DISCIPLINA */}
        <Modal backdropPressToClose={false} coverScreen={true} keyboardTopOffset={0} style={[styles.modal, styles.modal3]} position={"center"} ref={"modal3"} isDisabled={isDisabled}>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.modalTitle}>
              {labels.newSubject}
            </Text>
          </View>

          <Item rounded style={error ? styles.error : styles.ok}>
            <Input Textbox placeholder=" Nome da disciplina" onChangeText={nomeEditar => this.setState({ nomeEditar, error: false })}
              style={{ color: 'gray' }}
              value={nomeDisciplina} />
              {error ?
                <Icon style={{ color: 'rgba(231,76,60,1)' }} name='close-circle' />
              :
                <Text></Text>
              }
          </Item>

          <View style={styles.viewButtonsModal}>
            <Button style={{fontSize: 12, backgroundColor: '#fe3939', opacity: .8 }} onPress={() => this.closeModal()} small>
              <Text>{labels.cancel}</Text>
            </Button>
            <Button style={{fontSize: 12, backgroundColor: 'steelblue', marginLeft: 20 }} onPress={() => this.newSubject()} small>
              <Text>{labels.create}</Text>
            </Button>
          </View>
        </Modal>

         {/*  MODAL EDITAR NOME DISCIPLINA */}
         <Modal backdropPressToClose={false} coverScreen={true} keyboardTopOffset={0} style={[styles.modal, styles.modal3]} position={"center"} ref={"RefModalChangeName"} isDisabled={this.state.isDisabled}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalTitle}> {labels.editSubject} </Text>
            </View>

            {salvou 
            ?   
              <View style={{marginTop: 20}}>
                  <Text style={{color: 'gray', textAlign: 'center', fontSize: 18, marginBottom: 20}}> {labels.nameChangedSuccessfull} </Text>

                  <Button small onPress={() => this.closeModal()} style={{alignSelf: 'center', marginTop: 5, marginLeft: 15, backgroundColor: 'steelblue', padding: 10 }}>
                    <Text style={{ fontSize: 12, textAlign: 'center' }}> {labels.understand} </Text>
                  </Button>
              </View>
            :
              <View>
                <Item rounded style={error ? styles.error : styles.ok}>
                  <Input Textbox placeholder=" Nome da disciplina" onChangeText={nomeDisciplina => this.setState({ nomeDisciplina, error: false })}
                    style={{ color: 'gray' }}
                    value={nomeEditar} />
                  {error 
                  ?
                    <Icon style={{ color: 'rgba(231,76,60,1)' }} name='close-circle' />
                  :
                    <Text/>
                  }
                </Item>

                <View style={styles.viewButtonsModal}>
                  <Button style={{ fontSize: 12, backgroundColor: '#fe3939', opacity: .8 }} onPress={() => this.closeModal()} small >
                    <Text> {labels.cancel} </Text>
                  </Button>
                  <Button style={{ fontSize: 12, backgroundColor: 'steelblue', marginLeft: 20}} onPress={() => this.changeName()} small >
                    <Text> {labels.changeName} </Text>
                  </Button>
                </View>
              </View>
            }
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0', 
    height: '100%'
  },

  header: { 
    alignItems: "center", 
    backgroundColor: '#279bce', 
    paddingTop: 12, 
    paddingBottom: 12, 
    paddingLeft: 20, 
    paddingRight: 20, 
    alignContent: "center", 
    flexDirection: 'row' 
  },

  nameSubject: { 
    marginLeft: 5, 
    color: 'gray' 
  },

  iconArrow: { 
    position: 'absolute', 
    right: 15, 
    color: 'gray' 
  },

  flatListNone: { 
    color: 'gray', 
    fontFamily: 'Roboto', 
    textAlign: 'center', 
    fontSize: 18, 
    marginTop: 30 
  },

  flatListFull: { 
    paddingTop: 10, 
    paddingLeft: 10, 
    paddingRight: 10, 
    paddingBottom: 10, 
    marginBottom: 10 
  },

  title: {
    color: '#fff',
    fontFamily: 'Roboto',
    fontSize: 20,
    flex: 1
  },

  modalTitle: { 
    textAlign: 'center', 
    color: 'steelblue', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },

  viewButtonsModal: { 
    alignItems: 'center', 
    marginTop: 30, 
    flexDirection: 'row', 
    alignContent: 'center', 
    justifyContent: 'center' 
  },

  viewDisciplinas: {
    backgroundColor: '#fff',
    padding: 5,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    flex: 1,
    borderColor: '#bdc3c7',
    borderWidth: .2
  },

  botaoNovoProjeto: {
    marginTop: 5,
    width: 150,
    justifyContent: 'center',
  },

  trashImage: {
    width: 45,
    height: 45,
  },

  ok: {
    marginTop: 30,
    borderColor: 'gray',
    paddingLeft: 10,
    height: 40
  },

  error: {
    marginTop: 30,
    borderColor: 'red',
    paddingLeft: 10,
    height: 40,
  },

  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  modal3: {
    height: 'auto',
    minHeight: 100,
    width: '90%',
    padding: 15,
    borderRadius: 5
  },
})





