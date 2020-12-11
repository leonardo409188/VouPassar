import React, { Component } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Container, Tab, Tabs, TabHeading, Icon, Text } from 'native-base';
import Performance7 from '../../../../performance/Performance7days';
import Performance15 from '../../../../performance/Performance15days';
import Custom from '../performance/Custom'
import Search from '../performanceSearch/PerformanceSearch'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import moment from 'moment'
import 'moment/locale/pt-br';
import firebase from 'react-native-firebase';
import { getUser, getDaysRemaining, getAllDates, getMillieseconds, getMilliesecondsToDate } from '../../../utils/functions';
import { labels, messages, routeNames } from '../../../utils/constants'

export default class PerformanceHome extends Component {

  constructor() {
    super();
    this.state = {
      fill: 0,
      isLoading: true,
    }
  }

  componentDidMount(){
    const user = getUser();
    const { uid } = user;
    
    this.setState({ uid }, () => {
      this.getPerformanceSettings(uid);
    }) 
  }

  getPerformanceSettings(uid) {
    firebase.database().ref('usuarios/' + uid ).on('value', (snapshot) => {
      if (snapshot.val() !== null) {
        const { meta, tipoMeta, tempoMeta } =  snapshot.toJSON();
  
        if (meta) {
          this.setState({ isLoading: false });
        } 

        this.setState({ meta, tipoMeta, tempoMeta }, () => {
          this.getDates();
        })
      }
    });     
  }

  getDates = () => {
    const { daysRemaining, startDate, endDate } = getDaysRemaining(this.state.tipoMeta);
    const dates = getAllDates(startDate, endDate); 
    
    this.setState ({diasRestantes: daysRemaining}, () => {
      this.getInfos(dates, this.state.uid, this.state.tempoMeta)
    })
  }

  getInfos = (dates, uid, tempoMeta) => {
    var tempoTotal = 0
  
    dates.forEach((date)=> {
      var last7 = moment(date, 'dd-mm-yyyy').format();
      var last7formated = moment(last7).format('DD-MM-YYYY')

      firebase.database().ref('usuarios/' + uid + '/finalizados/' + last7formated).on('value',  (snapshot) => {               
        snapshot.forEach((doc) => { 
            const { tempoTarefa } = doc.toJSON();   
            var tempoTarefaPlus = getMillieseconds(tempoTarefa);  
            
            tempoTotal = tempoTotal  += tempoTarefaPlus
        });    
        
        // Total convertido
        const tempoTotalConvertido = getMilliesecondsToDate(tempoTotal); 
        var meta = getMillieseconds(tempoMeta);

        // porcentagem concluída  
        var fill = ((tempoTotal * 100) / meta).toFixed(2);

        // Restante Convertido
        var tempoRestante =  (meta - tempoTotal);
        const tempoRestanteConvertido = getMilliesecondsToDate(tempoRestante);
        
        // Calcula a média que a pessoa tem que fazer por dia para chegar na meta
        var mediaRestante = (tempoRestante / this.state.diasRestantes);
        const mediaRestanteConvertida = getMilliesecondsToDate(mediaRestante);

        this.setState({ tempoTotalConvertido, fill, tempoRestante: tempoRestanteConvertido, mediaRestanteConvertida, isLoading: false });          
      })
    })
  }

  render() {
    const { isLoading, meta, fill, tempoTotalConvertido, tempoMeta, tipoMeta, tempoRestante, mediaRestanteConvertida } = this.state;
    return (
      <Container>
        <Tabs tabBarUnderlineStyle={{}}>
          <Tab heading={ <TabHeading style={{backgroundColor: '#279bce'}}><Icon style={{color: '#fff'}} name="home" /></TabHeading>}>
              <View style={styles.container}>
              {isLoading 
              ?
                <View style={styles.containerMenor}>
                    <View style={{padding: 20}}>
                      <ActivityIndicator size="large" color="steelblue" />
                    </View>
                </View>
              :              
                meta 
                ?
                  <View style={styles.containerMenor}>
                    <View style={{ paddingTop: 2, alignItems: 'center'}}> 
                      <AnimatedCircularProgress
                        size={145}
                        width={17}
                        fill={fill}
                        rotation={0}
                        tintColor="#279bce"
                        duration={1000}
                        backgroundColor="#3d5875">
                          {
                            (fill) => (
                              <View style={{alignItems: 'center'}}>
                                <Text style={{fontSize: 20, color: 'steelblue', fontWeight: 'bold'}}>
                                  {fill}%
                                </Text>
                                {tempoTotalConvertido === '0:00' 
                                ?
                                  <Text style={styles.timeFill}>{labels.defaultTime} </Text> 
                                : 
                                  <Text style={styles.timeFill}>{tempoTotalConvertido}</Text>
                                }
                              </View>
                            )
                          }
                      </AnimatedCircularProgress>   
                    </View>
                    <View style={{flexDirection: 'column', marginLeft: 0}}>  
                      <View style={styles.lines}>
                        <Text style={styles.title}>{labels.goalType}</Text> 
                        <Text style={styles.subtitle}>{tipoMeta}</Text>
                      </View> 
                      <View style={styles.lines}>
                        <Text style={styles.title}>{labels.goalLabel}</Text>
                        <Text style={styles.subtitle}>{tempoMeta}</Text>
                      </View>  
                      <View style={styles.lines}>
                        <Text style={styles.title}>{labels.timeDone}</Text> 
                        {tempoTotalConvertido === '0:00' 
                        ?
                          <Text style={styles.subtitle}>{labels.timeFill} </Text> 
                        : 
                          <Text style={styles.subtitle}>{tempoTotalConvertido}</Text>
                        }
                      </View>
                      <View style={styles.lines}>  
                        <Text style={styles.title}>{labels.timeLeft}</Text>
                        <Text style={styles.subtitle}>{fill < 100 ? tempoRestante : labels.defaultTime}</Text>
                      </View>  
                      <View style={styles.lines}>
                        <Text style={styles.title}>{labels.daysLeft}</Text> 
                        <Text style={styles.subtitle}>{this.state.diasRestantes}</Text>
                      </View> 

                      {/* condição se atingir a meta */}
                      {fill < 100 
                      ?
                        <View style={styles.messageGoalView}>
                          <Text style={{color: 'gray', fontSize: 16, textAlign: 'center'}}> {messages.goalLeft} {mediaRestanteConvertida} {messages.forDay}</Text>
                        </View>  
                      :

                        <View style={styles.messageGoalView}>
                            <Text style={{color: 'green', fontSize: 16, textAlign: 'center', marginBottom: 4, fontWeight: 'bold'}}>{messages.goalComplete} {tipoMeta}!</Text>
                        </View> 

                      }
                    </View>
                  </View>
              : 
                <View style={styles.containerMenorSemMetas}>
                  <Text style={{color: 'gray', textAlign: 'center', fontSize: 18, fontFamily: 'Roboto'}}>{messages.whithoutGoal}</Text>
                </View>
              }
              <TouchableOpacity onPress={() => {
                  this.props.navigation.navigate(routeNames.PerformanceSettings, {
                    logado: true,
                  });
              }}>
                <Text style={{marginTop: 15, color: 'steelblue', fontSize: 18}}>{labels.changeOrCancelGoal}</Text>
              </TouchableOpacity>

            </View>
          </Tab>  
          <Tab heading={<TabHeading style={{backgroundColor: '#279bce'}}><Icon style={{color: '#fff'}} name="search" /></TabHeading>}>
            <Search/>
          </Tab>
          <Tab heading={<TabHeading style={{backgroundColor: '#279bce'}}><Text style={{color: '#fff', fontSize: 14, textAlign: "center"}}>{labels.lastSevenDays}</Text></TabHeading>}>
            <Performance7 />
          </Tab>
          <Tab heading={ <TabHeading style={{backgroundColor: '#279bce'}}><Text style={{color: '#fff', fontSize: 14, textAlign: "center"}}>{labels.lastFifteenDays}</Text></TabHeading>}>
            <Performance15 />
          </Tab>
          <Tab heading={ <TabHeading style={{backgroundColor: '#279bce'}}><Text style={{color: '#fff', fontSize: 14, textAlign: "center"}}>{labels.customPeriod}</Text></TabHeading>}>
            <Custom/>
          </Tab>
        </Tabs>
      </Container> 
    );
  }
}

const styles = StyleSheet.create({
  container :{ 
    padding: 10, 
    backgroundColor: '#f0f0f0', 
    height: '100%', 
    alignItems: 'center' 
  },

  containerMenorSemMetas:{
    backgroundColor: '#fff', 
    padding: 15,
    alignContent: 'center', 
    width: '100%',
    borderRadius: 10,
    borderColor: '#bdc3c7',
    borderWidth: .2
  },

  containerMenor: {
    backgroundColor: '#fff', 
    borderRadius: 10, 
    paddingRight: 15, 
    paddingLeft: 15, 
    paddingBottom: 0,
    alignContent: 'center', 
    width: '100%',
    borderColor: '#bdc3c7',
        borderWidth: .2
  },

  lines:{
    borderBottomColor: '#f0f0f0', 
    borderBottomWidth: .9, 
    padding: 8, 
    marginTop: 5,
    flexDirection: 'row'
  },

  title: {
    color: 'steelblue', 
    fontSize: 18, 
    marginRight: 4, 
    fontWeight: "bold"
  },
  
  subtitle: {
    color: 'gray', 
    fontSize: 18
  },

  timeFill: {
    fontSize: 20, 
    color: 'steelblue', 
    fontWeight: 'bold'
  },

  messageGoalView: {
    borderBottomColor: '#f0f0f0',  
    borderBottomWidth: .9, 
    padding: 6, 
    marginTop: 5, 
    alignItems: 'center'
  }
})