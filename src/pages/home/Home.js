import React from 'react';
import { StyleSheet, FlatList, View, Dimensions, AppState, ScrollView, BackHandler, ToastAndroid  } from 'react-native';
import firebase from 'react-native-firebase';
import { Text, Button, Icon } from 'native-base';
import { getUser, getCurrentDate } from '../../utils/functions'
import { messages, config, routeNames, labels } from '../../utils/constants';

const width = Dimensions.get('screen').width;

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      countTarefa: 0,
      countRevisao: 0,
      currentDate: '',
      nomeDisciplina: '',
      seconds: 5,
      backButtonCount: 0
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

    const user = getUser();
    const currentDate = getCurrentDate(true);
    const moment = getCurrentDate(false)
    const { uid, email, displayName } = user;

    this.setState({ uid, email, displayName, currentDate, moment }, () => {
      this.loadData();
    });
  }

  loadData = () => {
    const { uid, currentDate } = this.state;
    const tarefaHoje = [];
    const revisaoHoje = [];
    var countTarefa = 0;
    var countRevisao = 0;
 
    firebase.database().ref('usuarios/' + uid + '/calendario/' + currentDate).on('value', (snapshot) => {
      snapshot.forEach((doc) => {
        const { nomeConteudo, keyConteudo, keyDisciplina, nomeDisciplina, tipo, status } = doc.toJSON();
      
        if (tipo === config.task) {
          countTarefa ++
          tarefaHoje.push({
            key: doc.key,
            tarefaHoje: keyConteudo, nomeConteudo, keyDisciplina, status, nomeDisciplina
          });
  
          this.setState({ tarefaHoje, countTarefa });
        } else {
          countRevisao ++
          revisaoHoje.push({
            key: doc.key,
            revisaoHoje: keyConteudo, nomeConteudo, keyDisciplina, status, nomeDisciplina
          });
          
          this.setState({ revisaoHoje, countRevisao });
        }
      }); 
    })
  }

  // pede para clicar mais de uma vez para sair do aplicativo
  handleBackButton = () => {
    if (this.state.backButtonCount === 0) {
      this.setState({ backButtonCount: 1});
      ToastAndroid.show(messages.clickTwice, ToastAndroid.SHORT);
      
      setTimeout(() => {
        this.setState({backButtonCount: 0});
      }, 2000);

      return true;
    } else { 
      BackHandler.exitApp();
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  render() {
    const { tarefaHoje, revisaoHoje, displayName, moment, countTarefa, countRevisao } = this.state;
    let flatlistTarefas;

    if (countTarefa === 0) {
      flatlistTarefas = <View style={styles.viewDisciplinas}>
                           <Text style={styles.withoutTasksText}>{messages.withoutTasks}</Text>
                        </View>
    } else {
      flatlistTarefas = <FlatList
        data={tarefaHoje}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.flatList} >
              <Button style={styles.viewDisciplinas} onPress={() => {
                this.props.navigation.navigate(routeNames.DetailsActivities, {
                  keyConteudo: item.keyConteudo,
                  keyDisciplina: item.keyDisciplina,
                  nomeConteudo: item.nomeConteudo,
                });
              }} >
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.nomeConteudo}>{item.nomeConteudo}</Text>
                  <Text style={styles.nomeDisciplina}>{item.nomeDisciplina}</Text>
                </View>

                {item.status === config.concluded 
                ?
                  <View style={{ position: 'absolute', right: 0, alignItems: 'center' }}>
                    <Icon type="FontAwesome" name="check-circle" style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 14 }}>{labels.concluded}</Text>
                  </View> 
                :

                item.status === config.started 
                ?
                  <View style={{ position: 'absolute', right: 5, alignItems: 'center' }}>
                    <Icon type="FontAwesome5" name="hourglass-half" style={{ color: 'orange', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: 'orange', fontWeight: 'bold', fontSize: 14 }}>{labels.started}</Text>
                  </View> 
                :
                  <View style={{ position: 'absolute', right: 7, alignItems: 'center' }}>
                    <Icon type="FontAwesome5" name="clock" style={{ color: '#14447b', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: '#14447b', fontWeight: 'bold', fontSize: 14 }}>{labels.toDo}</Text>
                  </View>
                }
              </Button>
            </View>
          )
        }}
        keyExtractor={item => item.key}
      >
      </FlatList>
    }

    // conditional render para a flatlist DAS REVISOES
    let flatlistRevisoes;

    if (countRevisao === 0) {
      flatlistRevisoes = <View style={styles.viewDisciplinas}>
                           <Text style={styles.withoutTasksText}>Você não tem Revisões para hoje.</Text>
                         </View>
    } else {
      flatlistRevisoes = <FlatList
        data={this.state.revisaoHoje}
        renderItem={({ item, index }) => {
          return (
            <View style={styles.flatList}  >
              <Button style={styles.viewDisciplinas} onPress={() => {
                this.props.navigation.navigate(routeNames.DetailsActivities, {
                  keyConteudo: item.keyConteudo,
                  keyDisciplina: item.keyDisciplina,
                  nomeConteudo: item.nomeConteudo,
                });
              }} >
                <View style={{ flexDirection: 'column' }}>
                  <Text style={styles.nomeConteudo}>{item.nomeConteudo}</Text>
                  <Text style={styles.nomeDisciplina}>{item.nomeDisciplina}</Text>
                </View>

                {item.status === config.concluded 
                ?
                  <View style={{ position: 'absolute', right: 0, alignItems: 'center' }}>
                    <Icon type="FontAwesome" name="check-circle" style={{ color: 'green', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 14 }}>{labels.concluded}</Text>
                  </View> 
                :
                  item.status === config.started
                ?
                  <View style={{ position: 'absolute', right: 5, alignItems: 'center' }}>
                    <Icon type="FontAwesome5" name="hourglass-half" style={{ color: 'orange', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: 'orange', fontWeight: 'bold', fontSize: 14 }}>{labels.started}</Text>
                  </View> 
                :
                  <View style={{ position: 'absolute', right: 7, alignItems: 'center' }}>
                    <Icon type="FontAwesome5" name="clock" style={{ color: '#14447b', fontWeight: 'bold', fontSize: 16 }} />
                    <Text style={{ color: '#14447b', fontWeight: 'bold', fontSize: 14 }}>{labels.toDo}</Text>
                  </View>
                }
              </Button>
            </View>
          )
        }}
        keyExtractor={item => item.key}
      >
      </FlatList>
    }

    return (
      <View style={{ backgroundColor: '#f0f0f0', height: '100%' }}>
        <View style={{ backgroundColor: '#279bce', padding: 15, flexDirection: 'row', alignContent: 'center', alignItems: "center" }}>
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontFamily: 'Roboto', fontSize: 28, fontWeight: "bold", color: '#fff' }}> {labels.hello}{displayName}! </Text>
            <Text style={{ fontFamily: 'Roboto', fontSize: 20, color: '#fff' }}> {moment} </Text>
          </View>
        </View>

        <ScrollView style={styles.container}>
          <Text style={{ color: '#14447b', fontSize: 14, marginTop: 10, fontWeight: 'bold', marginLeft: 5 }}> {labels.tasks} </Text>
          {flatlistTarefas}

          <Text style={{ color: '#14447b', fontSize: 14, marginTop: 20, marginBottom: 3, fontWeight: 'bold', marginLeft: 5 }}> {labels.revisions} </Text>
          {flatlistRevisoes}
        </ScrollView>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: width,
    padding: 10,
    marginBottom: 10
  },

  title: {
    color: '#fff',
    fontFamily: 'Open Sans',
    fontWeight: 'bold'
  },

  withoutTasksText: { 
    color: 'gray', 
    fontSize: 15, 
    fontWeight: 'bold', 
    paddingLeft: 12, 
    paddingTop: 7, 
    paddingBottom: 7 
  },

  flatList: { 
    flexDirection: 'row', 
    alignItems: 'center'
  },

  viewDisciplinas: {
    backgroundColor: '#fff',
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 10,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    width: '100%',
    borderColor: '#bdc3c7',
    borderWidth: .2,
  },

  image: {
    width: 65,
    height: 65,
    borderRadius: 65 / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#fff",
    marginRight: 20,
  },

  nomeConteudo: {
    color: '#14447b',
    fontSize: 15,
    fontWeight: 'bold'
  },

  nomeDisciplina: {
    marginTop: -2,
    fontSize: 13,
    color: 'gray'
  },

  button: {
    position: 'absolute',
    right: 8,
    height: '100%',
    borderColor: '#14447b'
  }
})





