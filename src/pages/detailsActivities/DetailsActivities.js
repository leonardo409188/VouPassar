import React, { Component } from 'react';
import RadioForm from 'react-native-simple-radio-button';
import { View, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight, Switch, Picker, Linking } from 'react-native';
import { getUser, getCurrentDate, getMillieseconds, resetTime, updateDetails, finishTasks } from '../../utils/functions'
import { Stopwatch } from 'react-native-stopwatch-timer';
import { TextInputMask } from 'react-native-masked-text';
import moment from 'moment';
import Autolink from 'react-native-autolink';
import ActionButton from 'react-native-action-button';
import Modal from 'react-native-modalbox';
import { Button, Icon, Text } from 'native-base';
import firebase from 'react-native-firebase';
import { labels, config, routeNames, messages } from '../../utils/constants'

const width = Dimensions.get('screen').width;

var radio_props = [
  { label: 'Automático', value: 0 },
  { label: 'Manual', value: 1 }
];

export default class DetailsActivities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      periodoRevisao: 7,
      revisao: false,
      dialogVisible: false,
      show: false,
      backButtonCount: 0,
      timeInput: '000000',
      isStopwatchStart: false,
      resetStopwatch: true,
    };

    this.startStopStopWatch = this.startStopStopWatch.bind(this);
    this.resetStopwatch = this.resetStopwatch.bind(this);
    this.currentTime = this.state.currentTime;
  }

  componentDidMount() {
    const user = getUser();
    const { uid } = user;
    const currentDate = getCurrentDate(true);

    //pega a key que veio da página anterior
    const  { keyConteudo, keyDisciplina, nomeConteudo, color } = this.props.navigation.getParam();

    this.setState({ uid, keyConteudo, keyDisciplina, nomeConteudo, color, dataAtual: currentDate }, () => {
      getDetails(uid, keyDisciplina, keyConteudo);
    });
  } 

  getDetails(uid, keyDisciplina, keyConteudo) {
    // Pega todos os dados do conteudo
    firebase.database().ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + keyConteudo).on('value', (snapshot) => {
      if (snapshot.val() !== null) {
        const { nomeDisciplina, dataTarefa, tipo, status, tempoTarefa, keyHoje, urlDocumento, anotacoes, nomeArquivo } = snapshot.val();
        const myMoment = moment(dataTarefa, 'DD-MM-YYYY');
        const dataFormatada = moment(myMoment).format('DD/MMM/YY', 'pt-BR');
        const millieseconds = getMillieseconds(tempoTarefa);

        this.setState({ nomeDisciplina, dataTarefa, tipo, status, keyHoje,  urlDocumento, anotacoes, nomeArquivo, dataFormatada,
          currentTime: millieseconds, // seta no automatico
          timeInput: tempoTarefa, // seta no manual 
        })
      }
    });  
  }

  startStopStopWatch() {
    this.setState({
      isStopwatchStart: !this.state.isStopwatchStart,
      resetStopwatch: false,
    });
  }

  resetStopwatch() {
    const {uid, keyDisciplina, keyConteudo} = this.state;
    this.setState({ isStopwatchStart: false, resetStopwatch: true, currentTime: '000000' }, () => {
      resetTime(uid, keyDisciplina, keyConteudo);
    });
  }

  getFormattedTime = (time) => {
    this.currentTime = time;
  }

  // Switch button
  toggleSwitch = value => {
    this.setState({ revisao: value })
  };

  updateDetail = () => {
    const { value, uid, keyDisciplina, keyConteudo, keyHoje, dataTarefa, timeInput } = this.state;
    const tempoTarefa = (value === 0 ? this.currentTime : timeInput);

    updateDetails(uid, keyDisciplina, keyConteudo, keyHoje, dataTarefa, tempoTarefa);
  }

  openFile = () => {
    Linking.canOpenURL(this.state.urlDocumento).then(supported => {
      if (supported) {
        Linking.openURL(this.state.urlDocumento);
      } 
    });
  };

  finishTask = () => {
    const { urlDocumento, value, timeInput } = this.state;

    const temDocumento = (urlDocumento === null ? false : true);
    const tempoTarefa = (value === 0 ? this.currentTime : timeInput);

    finishTasks(this.state, temDocumento, tempoTarefa);

    this.setState({ status: 'Concluido' }, () => {
      this.refs.modal2.close();
    })
  }

  handleOpen = () => {
    this.setState({ show: true })
  }

  handleClose = () => {
    this.setState({ show: false })
  }

  render() {
    const { tipo, value, currentTime, isStopwatchStart, resetStopwatch, status, timeInput, 
      revisao, periodoRevisao, nomeConteudo, nomeDisciplina, dataFormatada, color, keyDisciplina } = this.state;

    //condição do timer
    let time;

    if (value === 0) {
      time = <View style={{ alignItems: "center" }}>
                <Stopwatch
                  laps
                  startTime={currentTime}
                  start={isStopwatchStart}
                  reset={resetStopwatch}
                  options={styles}
                  getTime={this.getFormattedTime}
                />
                {status !== config.concluded
                ?
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableHighlight onPress={this.startStopStopWatch}>
                      <Text style={{ fontSize: 20, marginTop: 10, margin: 10, marginRight: 20, color: '#14447b' }}>
                        {!isStopwatchStart ? labels.start : labels.pause}
                      </Text>
                    </TouchableHighlight>

                    {!isStopwatchStart 
                    ?
                      <TouchableHighlight onPress={this.resetStopwatch}>
                        <Text style={{ fontSize: 20, margin: 10, marginLeft: 20, color: '#14447b' }}> {labels.reset} </Text>
                      </TouchableHighlight> 
                    : 
                      <Text/>
                    }
                  </View>
                : 
                  <View/>
                }
              </View>
    } else {
      time = <View style={{ alignItems: "center" }}>
                <TextInputMask
                  keyboardType="number-pad"
                  type={'custom'}
                  options={{
                    mask: '99:99:99'
                  }}
                  value={timeInput}
                  onChangeText={text => {
                    this.setState({
                      timeInput: text
                    })
                  }}
                  style={{ fontSize: 40, color: '#14447b', fontFamily: 'Roboto', marginTop: -10 }}
                />
                <Text style={{ marginTop: -10, color: 'gray' }}>{labels.timeFormat}</Text>
             </View>
    }

    var picker;

    if (revisao) {
      picker = <Picker
        selectedValue={periodoRevisao}
        style={{ width: 120, right: 0, position: 'absolute', color: 'gray' }}
        onValueChange={(itemValue, itemIndex) =>
          this.setState({ periodoRevisao: itemValue })
        }>
        <Picker.Item label="7 Dias" value="7" />
        <Picker.Item label="15 Dias" value="15" />
        <Picker.Item label="1 Mês" value="30" />
      </Picker>
    }

    return (
      <View style={{ flex: 1, backgroundColor: '#f0f0f0' }}>
        <View style={styles.background}>
          <View>
            <Text style={styles.headerTitle}>{nomeConteudo}</Text>
            <Text style={styles.headerSubtitle}>({nomeDisciplina})</Text>
          </View>
          <View style={styles.headerStatus}>
            <Icon type="FontAwesome5" name={status === config.toDo ? "clock" : status === config.started ? "hourglass-half" : "check-circle" } 
                  style={styles.icon}/>
            <Text style={styles.textIcon}>{status === config.toDo ? labels.toDo : status === config.started ? labels.started : labels.concluded } </Text>
          </View>
        </View>

        <View style={{ padding: 10, paddingLeft: 15 }}>
          <Text style={{ color: 'gray' }}>Data: {dataFormatada} </Text>
          <Text style={{ color: 'gray' }}>{labels.type}  {tipo === revisao ? labels.review : tipo === 'questao' ? labels.questions : labels.tasks}</Text>
          <TouchableOpacity style={{ position: 'absolute', right: 20, top: 20 }}>
            <Icon onPress={() => this.refs.modal3.open()} type="FontAwesome5" name="paperclip" style={styles.iconClip} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, alignItems: 'center', paddingTop: 5, paddingLeft: 15, paddingRight: 15 }}>
          <View style={{ backgroundColor: '#fff', width: '100%', borderRadius: 10, alignItems: "center", padding: 10 }}>
            {status !== config.concluded 
            ?
              <RadioForm
                radio_props={radio_props}
                buttonSize={15}
                initial={0}
                labelStyle={{ fontSize: 16, color: 'gray', marginRight: 3, marginLeft: -5 }}
                formHorizontal={true}
                labelHorizontal={true}
                buttonColor={'#2196f3'}
                animation={true}
                onPress={(value) => { this.setState({ value }) }}
              />
            : 
              <View>
                <Text style={{ marginTop: 10, color: 'gray' }}>{labels.concludedIn}</Text>
              </View>
            }
            <View>
              {time}
            </View>
          </View>

          {status !== config.concluded 
          ?
            <>
              <View style={styles.switchReview}>
                <Switch
                  thumbColor='#2196f3'
                  onValueChange={this.toggleSwitch}
                  value={revisao}
                />
                <Text style={{ color: 'gray' }}> {labels.reviewIn} </Text>
                {picker}
              </View>

              <View style={{ marginTop: 30, flexDirection: 'row' }}>
                <TouchableHighlight >
                  <Button small onPress={this.updateDetail} style={styles.button}>
                    <Text style={{ fontSize: 14 }}> {labels.saveProgress} </Text>
                  </Button>
                </TouchableHighlight>
                <TouchableHighlight style={{marginLeft: 20}} >
                  <Button small onPress={() => this.refs.modal2.open()}  style={styles.button}>
                    <Text style={{ fontSize: 14 }}> {labels.finishTask} </Text>
                  </Button>
                </TouchableHighlight>
              </View>
            </>
          : 
            <View/>
          }
        </View>

        {!isStopwatchStart 
        ?
          <View style={{ flex: 1 }}>
            <ActionButton
              size={55}
              offsetX={20} offsetY={20}
              renderIcon={active => active ? (<Icon name="md-arrow-back" style={{color: '#fff'}} />) : (<Icon name="ios-arrow-back" style={{color: '#fff'}} />)}
              position="left"
              buttonColor="gray"
              onPress={() => {
                this.props.navigation.navigate(routeNames.Contents, {
                  key: keyDisciplina,
                  name: nomeDisciplina,
                  color
                });
              }}
            >
            </ActionButton>
            <ActionButton
              size={55}
              offsetX={20} offsetY={20}
              renderIcon={active => active ? (<Icon name="ios-home" style={{ color: '#fff' }} />) : (<Icon name="ios-home" style={{ color: '#fff' }} />)}
              position="right"
              buttonColor="steelblue"
              onPress={() => {
                this.props.navigation.navigate(routeNames.Home)
              }}
            >
            </ActionButton>
          </View>
        :
          <View/>
        }

        {/* ------- Modal das notas --------- */}
        <Modal style={[styles.modal, styles.modal3]} position={"center"} ref={"modal3"} isDisabled={false}>
          <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: 24, textAlign: 'center' }}>{labels.annotationsAndAnexos}</Text>
          {(this.state.anotacoes || this.state.urlDocumento) !== null 
          ?
            <View>
              <View style={{ marginTop: 15 }}>
                {this.state.urlDocumento !== null 
                ?
                  <TouchableOpacity
                    style={{ marginBottom: 20 }}
                    onPress={this.openFile}>
                    <Text style={{ color: 'steelblue' }}><Icon name="ios-download" style={{ color: 'steelblue', fontSize: 22 }} />{this.state.nomeArquivo}</Text>
                  </TouchableOpacity>
                :
                  <View></View>
                }

                <Autolink
                  style={{ color: '#3E3E3E' }}
                  text={this.state.anotacoes}
                  hashtag="instagram"
                  mention="twitter" />
              </View>
            </View>
          :
            <View style={{ marginTop: 30, marginBottom: 20 }}>
              <Text style={{ textAlign: 'center' }}>{labels.annotations}</Text>
            </View>
          }

          <View style={{ alignItems: 'center' }}>
            <Button small onPress={() => this.refs.modal3.close()} style={{ marginTop: 25, backgroundColor: 'steelblue', padding: 10 }}>
              <Text style={{ fontSize: 12, textAlign: 'center', alignItems: 'center', alignContent: 'center' }}>{labels.close}</Text>
            </Button>
          </View>
        </Modal>

       <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal3]} position={"center"} ref={"modal2"} isDisabled={false}>
              <View style={{ alignItems: 'center'}}>
                      <Text style={{color: 'gray', textAlign: 'center', fontSize: 18}}> {messages.endContent} </Text>
              </View>
              <View style={{ alignItems: 'center', marginTop: 40, flexDirection: 'row', alignContent: 'center', justifyContent: 'center' }}>
                  <Button  onPress={() => this.refs.modal2.close()} small style={{ backgroundColor: '#fe3939' }}>
                      <Text style={{fontSize: 12}}>{labels.cancel}</Text>
                  </Button>
                  <Button onPress={this.finishTask} small style={{ backgroundColor: 'steelblue', marginLeft: 20 }}>
                      <Text style={{fontSize: 12}}>{labels.end}</Text>
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
  },

  container: {
    alignContent: 'center',
    alignItems: 'center',
  },

  text: {
    fontSize: 40,
    color: '#14447b',
    fontFamily: 'Roboto',
    marginTop: 0
  },

  background: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 15,
    paddingLeft: 15,
    backgroundColor: '#fff',
    width: width,
    alignContent: "center",
    alignItems: 'center',
    borderBottomWidth: .6,
    borderBottomColor: 'gray',
    flexDirection: 'row'
  },

  title: {
    color: '#007791',
    fontFamily: 'Open Sans',
    fontWeight: 'bold'
  },

  viewDisciplinas: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5
  },

  botaoNovoProjeto: {
    marginTop: 5,
    width: 150,
    justifyContent: 'center',
  },

  containerAnotacoes: {
    marginTop: 10,
    paddingTop: 2,
    paddingRight: 8,
    paddingBottom: 20,
    paddingLeft: 5,
    height: 'auto',
    minHeight: 40,
    backgroundColor: '#f7ebb1',
    borderTopColor: '#f8b401',
    borderTopWidth: 15,
    opacity: .8
  },

  modal: {
    justifyContent: 'center',
  },

  modal3: {
    height: 'auto',
    minHeight: 100,
    width: '90%',
    padding: 15,
    borderRadius: 5
  },

  icon: {
    fontWeight: 'bold', 
    fontSize: 18,
    color: this.state.status === config.toDo ? "#14447b" : this.state.status === config.started ? "orange" : "green",
  },

  textIcon: {
    fontSize: 16, 
    opacity: 100, 
    marginTop: 0, 
    fontWeight: 'bold',
    color: this.state.status === config.toDo ? "#14447b" : this.state.status === config.started ? "orange" : "green",
  },

  headerTitle: { 
    color: '#14447b', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },

  headerSubtitle: { 
    color: '#14447b', 
    fontSize: 14, 
    opacity: 100, 
    marginTop: -5 
  },

  headerStatus: { 
    position: 'absolute', 
    right: 20, 
    alignItems: 'center' 
  },

  iconClip: { 
    color: 'steelblue', 
    fontWeight: 'bold', 
    fontSize: 30 
  },

  switchReview: { 
    backgroundColor: '#fff', 
    width: '100%', 
    borderRadius: 5, 
    paddingTop: 15, 
    paddingRight: 5, 
    paddingBottom: 15,
    paddingLeft: 5, 
    marginTop: 15, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },

  button: { 
    backgroundColor: 'steelblue', 
    opacity: .9 
  }
})