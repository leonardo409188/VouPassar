import React, { Component } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';
import moment from 'moment';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { Text, Icon } from 'native-base';
import { getUser, getCurrentDate } from '../../utils/functions';
import { routeNames, config, messages } from '../../utils/constants/'

LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
  today: 'Aujourd\'hui'
};
LocaleConfig.defaultLocale = 'pt';

export default class CalendarsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDays: [],
      conteudosToday: [],
    };
    this.onDayPress = this.onDayPress.bind(this);
  }

  componentDidMount() {
    const user = getUser();
    const { uid } = user;
    const currentDate = getCurrentDate(true);
    const dateSelected = getCurrentDate(false);

    this.setState({ uid, currentDate, dateSelected }, () => {
      this.getCalendarContents(uid, currentDate);
      this.getDaysWithContents(uid);
    })  
  }

  getCalendarContents = (uid, date) => {
    firebase.database().ref('usuarios/' + uid + '/calendario/' + date).on('value', (snapshot) => {
      if (snapshot.val() === null) {
        this.setState({ conteudosToday: null })
      } else {
        const conteudosToday = [];
        snapshot.forEach((doc) => {
          const { nomeConteudo, keyConteudo, keyDisciplina, status, nomeDisciplina, dataTarefa } = doc.toJSON()
        
          conteudosToday.push({
            key: doc.key,
            conteudosToday: dataTarefa, nomeConteudo, keyConteudo, keyDisciplina, nomeDisciplina, status
          });
          this.setState({ conteudosToday });
        });
      }
    })
  }

  // Função que é chamada ao clicar no dia (usada para listar o que tem para fazer no dia)
  onDayPress = (day) => {
    const dateSelected = moment(day.dateString).format('DD/MM/YYYY');
    const date = moment(day.dateString).format('DD-MM-YYYY');

    this.setState({ dateSelected }, () => {
      this.getCalendarContents(this.state.uid, date); 
    });
  }

  getDaysWithContents(uid) { 
    firebase.database().ref('usuarios/' + uid + '/calendario/').on('value', (snapshot) => {
    const dates = [];

    snapshot.forEach((doc) => {
      var datas = (doc.key)
      const myMoment = moment(datas, 'DD-MM-YYYY');
      const formatted = moment(myMoment).format('YYYY-MM-DD');

      dates.push({ formatted });
    });

    var inputString = dates
    const allDays = []
    
    // Pega as datas
    for (var i = 0; i < inputString.length; i++) {
      for (var key in inputString[i]) {
        allDays.push(inputString[i][key])
      }
    }
    this.setState({ allDays }, (allDays) => {
      this.setMarkedDays(allDays);
    }) 
  })
  }

  // Pega o array de datas que tem coisas para fazer e seta como marked (usada para mostrar o "ponto" no dias)
  setMarkedDays = (allDays) => {
    var marked = allDays.reduce((c, v) =>
      Object.assign(c, { [v]: { selected: false, marked: true, dotColor: '#14447b' } }), { [this.state.selected]: { selected: true } });
    this.setState({ marked });
  } 

  render() {
    const { marked, dateSelected, conteudosToday } = this.state;

    return (
      <View style={styles.container}>
        <Calendar
          onDayPress={this.onDayPress}
          style={styles.calendar}
          hideExtraDays
          markedDates={marked}
        />
        <View style={{ backgroundColor: '#fff', alignItems: 'center' }}>
          <Text style={{ color: '#14447b', padding: 5, fontWeight: "bold" }}>{dateSelected}</Text>
        </View>

        {conteudosToday === null 
        ?
          <View>
            <Text style={styles.dayWithoutContent}> {messages.dayWithoutContent} </Text>
          </View>
        :
          <FlatList style={{ marginBottom: 5, paddingLeft: 10, paddingRight: 10, paddingBottom: 0 }}
            data={conteudosToday}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate(routeNames.DetailsActivities, {
                      keyConteudo: item.keyConteudo,
                      keyDisciplina: item.keyDisciplina,
                      nomeConteudo: item.nomeConteudo,
                    });
                  }} >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.viewCalendar}>
                      <Text style={{ color: '#14447b', fontWeight: 'bold', fontSize: 16 }}>{item.nomeConteudo}</Text>
                      <Text style={{ color: 'gray', fontSize: 12 }}>({item.nomeDisciplina})</Text>
                    </View>

                    <View style={{ position: 'absolute', right: 10, alignItems: 'center' }}>
                      <Icon type="FontAwesome" 
                            name={item.status === config.concluded ? "check-circle" : item.status === config.started ? "hourglass-half" : "clock" } 
                            style={{ color: item.status === config.concluded ? "green" : item.status === config.started ? "orange" : "#14447b" }, 
                            { fontWeight: 'bold', fontSize: 18}} />
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
            keyExtractor={item => item.key}
          >
          </FlatList>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  calendar: {
    borderTopWidth: 1,
    paddingTop: 0,
    marginTop: -5,
    borderBottomWidth: 1,
    borderColor: '#eee',
    height: 350
  },

  viewCalendar: {
    backgroundColor: '#fff',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 5,
    flexDirection: 'column',
    alignContent: 'center',
    width: '100%',
    flex: 1,
  },

  text: {
    textAlign: 'center',
    borderColor: '#bbb',
    padding: 10,
    backgroundColor: '#eee'
  },
  
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignContent: "center",
  },

  dayWithoutContent: { 
    color: 'gray', 
    textAlign: 'center', 
    fontSize: 16, 
    marginTop: 15 
  }
});