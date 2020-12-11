import React, { Component } from 'react';
import { Text, View, Dimensions, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import RadioForm from 'react-native-simple-radio-button';
import { TextInputMask } from 'react-native-masked-text';
import Modal from 'react-native-modalbox';
import { Button, Icon } from 'native-base';
import { config , labels, messages, routeNames } from '../../utils/constants';
import { getUser, getProviderId, updateUserInfos, getFacebookImage, typeGoal, calcGoal } from '../../utils/functions';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const radio_props = [
  { label: 'Diária', value: 0 },
  { label: 'Semanal*', value: 1 },
  { label: 'Mensal', value: 2 }
];

export default class PerformanceSettings extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
      horas: 0,
      timeInput: config.defaultTimeGoal,
      value: 0,
      uid: null,
      email: null,
      displayName: null,
      tipoMeta: null,
      showWarning: false,
      isUserLogged: false,
      imageProfile: config.defaultProfilePic
    }
  }

  componentDidMount() {
    const user = getUser();
    const { uid, email, displayName } = user;

    this.setState({ uid, email, displayName });

    const isUserLogged = this.props.navigation.getParam('logado'); //valida se a navegação ta vindo do cadastro ou das alterações de metas
    if (isUserLogged) {
      this.setState({ isUserLogged });
    }

    const checkProvider = getProviderId();
    if (checkProvider === labels.facebookUrl && !isUserLogged) {
      var imageProfile = getFacebookImage();
      this.setState({ imageProfile });
    }
  }

  changeValue = (value) => {
    this.setState({ value }, () => {
      this.fazConta(this.state.timeInput);
    });
  }

  fazConta = (timeInput) => {
    this.setState({ timeInput: timeInput })

    const { value } = this.state;
    const type = typeGoal(value);
    const hour = calcGoal(timeInput, type);

    if (type === 1) {
      this.setState({ tipoMeta: 'diaria', showWarning: false });
    } if (type === 7) {
      this.setState({ tipoMeta: 'semanal', showWarning: true });
    } else {
      this.setState({ tipoMeta: 'mensal', showWarning: false });
    }

    this.setState({ horas: hour });
  }

  saveGoal = () => {
    const { uid, displayName, email, tipoMeta, timeInput, isUserLogged, imageProfile } = this.state;

    if (timeInput === config.defaultTimeGoal) {
      this.refs.modal1.open();
    } else {
      this.setState({ isLoading: true });

      if (isUserLogged) {
        updateUserInfos(uid, displayName, email, null , true, tipoMeta, timeInput, true);
        this.props.navigation.navigate(routeNames.Main);
      }
      else {
        updateUserInfos(uid, displayName, email, imageProfile , true, tipoMeta, timeInput, false);
        this.props.navigation.navigate(routeNames.Main);
      }
    }
  }

  skipGoal = () => {
    const { uid, displayName, email, imageProfile, isUserLogged } = this.state;

    if (isUserLogged) {
      updateUserInfos(uid, displayName, email, null , false, null, null, null);
    } else {
      updateUserInfos(uid, displayName, email, imageProfile , false);
    }
    this.props.navigation.navigate(routeNames.Main);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.form}>
          <Text style={styles.goalTitle}> {labels.goal} </Text>
          <Text style={styles.textExplication}> {messages.goalMessage} </Text>

          <View style={styles.viewTimer}>
            <TextInputMask
              keyboardType="number-pad"
              type={'custom'}
              options={{
                mask: '999:99:99'
              }}
              value={this.state.timeInput}
              onChangeText={text => { this.fazConta(text) }}
              style={styles.timer}
            />
            <Text style={{ marginTop: -15, color: '#fff' }}> {labels.goalFormat} </Text>
          </View>

          <View style={{ marginTop: 30 }}>
            <RadioForm
              radio_props={radio_props}
              buttonSize={14}
              initial={0}
              labelStyle={{ fontSize: 15, color: '#fff' }}
              formHorizontal={true}
              buttonInnerColor={'#ffffff'}
              buttonOuterColor={'#ffffff'}
              labelHorizontal={false}
              selectedButtonColor={'#ffffff'}
              buttonColor={'#ffffff'}
              animation={true}
              onPress={(value) => { this.changeValue(value) }}
            />
          </View>

          <Text style={{ color: '#fff', fontSize: 60, marginTop: -20 }}> {labels.equals} </Text>
          <Text style={{ color: '#fff', fontSize: 24, marginTop: -20 }}> {this.state.horas}{labels.forDay} </Text>

          {this.state.showWarning 
          ?
            <Text style={styles.warningWeak}> {labels.startWeak} </Text>
          :
            <Text></Text>
          }

          <Button style={styles.buttonLogin}
            onPress={this.saveGoal}>
            {!this.state.isLoading 
            ?
              <Text style={{ textAlign: 'center', color: 'steelblue', padding: 20 }}> {labels.saveGoal} </Text>
            :
              <ActivityIndicator size="small" color="#steelblue" />
            } 
          </Button>

          {!this.state.isUserLogged 
          ?
            <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
              <Text onPress={this.skipGoal} style={styles.generalText}> {labels.skip}  <Icon name="ios-arrow-forward" style={styles.generalText} /> </Text>
            </View>

          :
            <View style={{flexDirection: 'row'}}>
              <View style={{ bottom: 0}}>
                <Text onPress={this.skipGoal} style={styles.generalText}> {labels.deleteGoal} </Text>
              </View>
              <View style={{ bottom: 0, marginLeft: 60 }}>
                <Text onPress={() => { this.props.navigation.navigate(routeNames.Main) }} style={styles.generalText}> {labels.goBack} <Icon name="ios-arrow-forward" style={styles.generalText} /> </Text>
              </View>
           </View>
          }

        </View>

        {/* -------- Modal erro --------------   */}
        <Modal keyboardTopOffset={0} style={[styles.modal, styles.modal1]} position={"center"} ref={"modal1"} isDisabled={this.state.isDisabled}>
          <Text style={{ color: 'gray', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>A meta está zerada, {'\n'}para continuar, insira uma meta ou aperte em "Pular"</Text>
          <Button small style={{ backgroundColor: 'steelblue', marginTop: 20 }}>
            <Text style={{ color: '#fff', paddingLeft: 15, paddingRight: 15 }} onPress={() => this.refs.modal1.close()}>Fechar</Text>
          </Button>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    backgroundColor: '#279bce', 
    height: height, 
    width: width, 
    padding: 5, 
    justifyContent: 'center'
  },

  form: { 
    alignItems: "center", 
    marginTop: 0, 
    alignContent: 'center' 
  },

  goalTitle: { 
    color: '#fff', 
    fontSize: 36 
  },

  textExplication: { 
    color: '#fff', 
    fontSize: 18, 
    marginTop: 15, 
    textAlign: 'center', 
    alignContent: 'center', 
    maxWidth: '90%' 
  },

  viewTimer: { 
    alignItems: "center", 
    marginTop: 15 
  },

  timer: { 
    fontSize: 40, 
    color: '#fff', 
    fontFamily: 'Roboto' 
  },

  warningWeak: { 
    color: '#fff', 
    fontSize: 12, 
    padding: 3, 
    borderColor: '#fff', 
    borderWidth: .3, 
    marginTop: 15 
  },

  generalText: { 
    color: '#fff', 
    fontSize: 20 
  },

  buttonLogin: {
    marginTop: 10,
    marginBottom: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    height: 30,
    width: 'auto'
  },

  modal: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  modal1: {
    height: 'auto',
    minHeight: 100,
    width: '90%',
    padding: 15,
    borderRadius: 5,

  },
})
