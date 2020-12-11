/*React Native TimeLine ListView / Flatlist*/
import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import {Button} from 'native-base'
import Timeline from 'react-native-timeline-flatlist';
import firebase from 'react-native-firebase'
import Modal from 'react-native-modalbox';
import moment from 'moment'
import 'moment/locale/fr';
 
export default class BasicTimeLine extends Component {
  constructor() {
    super();
    this.state = {
        valueFormatter:[],
        tempoTotal: 0,
        tempoTotalTarefas: 0,
        tempoTotalRevisoes: 0,
        porcentagemTarefas: 0,
        porcentagemRevisoes: 0,
        uid: null,
        detalhes: null,
        dialogVisible: false,
        dataTarefa: null,
        timeFormated: null,
        isLoading: null,
        isDisabled: false,
    }
  }

  componentDidMount(){
    const { currentUser } = firebase.auth()
    this.setState({ currentUser })
    var uid = currentUser.uid
    this.setState({ uid })

    setTimeout(() => {
    this.buscaDados().then(() => {
        setTimeout(() => {
          this.setState({isLoading: false})
        }, 2000); 
      })
    }, 100); 
    
  }// fim didMont

  buscaDados = async () =>{
        this.setState({isLoading: true})
        //Array de datas (7 dias atras)
        var getDates = function(startDate, endDate) {
            var dates = [],
                currentDate = startDate,
                addDays = function(days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
                };
            while (currentDate <= endDate) {
            dates.push(currentDate);
            currentDate = addDays.call(currentDate, 1);
            }
            return dates;
        };

        // Usage
        var dates = getDates(moment(new Date()).subtract(7 ,'days'), moment(new Date()).subtract(1, 'days'));  
        const valueFormatter = [];
        var tempoTotal = 0
        var totalTarefas = 0
        var totalRevisoes = 0

        dates.forEach((date)=> {
            var last7 = moment(date, 'dd-mm-yyyy').format();
            var last7formated = moment(last7).format('DD-MM-YYYY')
            
            // Busca no firebase cada data
            firebase.database().ref('usuarios/' + this.state.uid + '/finalizados/' + last7formated).on('value',  (snapshot)=>{
                if (snapshot.val()== null){
                    const myMoment = moment(last7formated, 'DD-MM-YYYY')
                    var time = moment(myMoment).format('DD/MM/YYYY', 'fr');   //dia
                    var description = 'Sem Tarefas' // Descrição
                    var title = '00:00:00' //tempo

                    var icon = require('../../assets/img/error.jpg')

                    valueFormatter.push({
                        valueFormatter: title ,title, description, time, icon
                    });
                    this.setState({
                        valueFormatter: valueFormatter,
                    })   
                }
                else if(snapshot.val() != null){     
                    const count = snapshot.numChildren();
                    if (count == 1){
                        const myMoment = moment(last7formated, 'DD-MM-YYYY')
                        var time = moment(myMoment).format('DD/MM/YYYY', 'fr'); 
                        var icon = require('../../assets/img/ok.jpg')

                        snapshot.forEach((doc) => { 
                            // usado apenas para pegar somar ao total
                            var tempoTarefa =  doc.toJSON().tempoTarefa     
                            var hms = tempoTarefa;   // your input string
                            var a = hms.split(':'); // split it at the colons
                            // minutes are worth 60 seconds. Hours are worth 60 minutes.
                            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                            var tempoTarefaPlus = (seconds * 1000)      
                            tempoTotal = tempoTotal  += tempoTarefaPlus
                                //converte millisegundos depois de somado
                
                            var tipo = doc.toJSON().tipo
                            var title =  doc.toJSON().tempoTarefa     
                            var description =  <Text>1 {tipo}</Text>        
                            valueFormatter.push({
                                key: doc.key,
                                valueFormatter: description, description, title, time, icon
                            }); 

                            if(tipo == 'tarefa'){
                                totalTarefas = totalTarefas + tempoTarefaPlus
                            }else{
                                totalRevisoes = totalRevisoes + tempoTarefaPlus
                            }
                        });
                    } else if(count > 1){
                        var countTarefa = 0;
                        var countRevisao = 0;
                        var totalDoIf = 0 //Total do if, usado para mostrar o total do DIA
                        const myMoment = moment(last7formated, 'DD-MM-YYYY')
                        var time = moment(myMoment).format('DD/MM/YYYY', 'fr');    
                        var icon = require('../../assets/img/ok.jpg')

                        snapshot.forEach((doc) => { 
                            var tipo = doc.toJSON().tipo
                        
                            var tempoTarefa =  doc.toJSON().tempoTarefa     
                            var hms = tempoTarefa;   // your input string
                            var a = hms.split(':'); // split it at the colons
                            // minutes are worth 60 seconds. Hours are worth 60 minutes.
                            var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]); 
                            var tempoTarefaPlus = (seconds * 1000)
                            
                            totalDoIf = totalDoIf += tempoTarefaPlus //faz a conta do Total do DIA
                        
                            tempoTotal = tempoTotal += tempoTarefaPlus // insere o total de cada dia no total 
                            if (tipo == 'tarefa'){
                                countTarefa++
                                totalTarefas = totalTarefas + tempoTarefaPlus
                            }else{
                                countRevisao++
                                totalRevisoes = totalRevisoes + tempoTarefaPlus
                            }    
                        })

                        var description = <Text>{countTarefa} Tarefas e {countRevisao} Revisões</Text>
                        //converte millisegundos depois de somado
                        
                        function times(millisec) {
                            var seconds = (millisec / 1000).toFixed(0);
                            var minutes = Math.floor(seconds / 60);
                            var hours = "";
                            if (minutes > 59) {
                                hours = Math.floor(minutes / 60);
                                hours = (hours >= 10) ? hours : "0" + hours;
                                minutes = minutes - (hours * 60);
                                minutes = (minutes >= 10) ? minutes : "0" + minutes;
                            }
                    
                            seconds = Math.floor(seconds % 60);
                            seconds = (seconds >= 10) ? seconds : "0" + seconds;
                            if (hours != "") {
                                return hours + ":" + minutes + ":" + seconds;
                            }
                            return minutes + ":" + seconds;
                        }
                        
                        var title = (times(totalDoIf)); 

                        valueFormatter.push({
                            valueFormatter: description, description, title, time, icon
                        });

                        this.setState({
                            valueFormatter: valueFormatter,
                        })   
                    }

                } //fim else if
                //converte millisegundos depois de somado
                function times(ms) {
                    return new Date(ms).toISOString().slice(11, -5);
                }

                // tempo total das tarefas, total das revisões e TOTAL MESMO
                var tempoTotalConvertido = (times(tempoTotal)); 
                var tempoTotalTarefas = (times(totalTarefas));
                var tempoTotalRevisoes = (times(totalRevisoes));

                // porcentagem das tarefas e revisões
                
                var porcentagemTarefas = ((totalTarefas * 100) / tempoTotal).toFixed(2)
                var porcentagemRevisoes = ((totalRevisoes * 100) / tempoTotal).toFixed(2)
                
                this.setState({
                    tempoTotalTarefas,
                    tempoTotalRevisoes,
                    porcentagemTarefas,
                    porcentagemRevisoes,
                    tempoTotal: tempoTotalConvertido
                }) 
                        
            })
        });  
  } 

  //Abre NOVO CONTEUDO
showDialog = () => {
    this.setState({ dialogVisible: true });
};

 //Fecha modal NOVO CONTEUDO
 handleCancel = () => {
  this.setState({ dialogVisible: false });
  this.setState ({dataTarefa: null }) 
};

  verDetalhes = (data)=>{
  
    var date =  data.time
    const myMoment = moment(date, 'DD/MM/YYYY', 'fr')
    var time = moment(myMoment).format('DD-MM-YYYY'); 
    var timeFormated = moment(myMoment).format('DD/MM/YYYY'); 
    this.setState ({dataTarefa: timeFormated })   

    //Lista os conteudo para ser feito no dia atual  
    firebase.database().ref('usuarios/' + this.state.uid + '/finalizados/' + time).on('value',  (snapshot)=>{
         if(snapshot.val()== null){
            this.setState({
                detalhes: null,
                dialogVisible: true
            })   
    }else{
    const detalhes = [];
    snapshot.forEach((doc) => { 
        var dataTarefa =  doc.toJSON().dataTarefa
        var nomeConteudo =  doc.toJSON().nomeConteudo
        var nomeDisciplina = doc.toJSON().nomeDisciplina
        var tipo = doc.toJSON().tipo
        var tempoTarefa = doc.toJSON().tempoTarefa  
        detalhes.push({

            detalhes: dataTarefa, dataTarefa, nomeConteudo, nomeDisciplina,tipo, tempoTarefa
        });
        this.setState({
            detalhes: detalhes,
        })
         
         
    });
    }
  })
    this.refs.modal1.open();
 
}
 
  render() {
    const flatlistCompara = this.state.detalhes
    var flatlist;

    if(flatlistCompara == null){
        flatlist = <Text style={{marginTop: 30, marginBottom: 20, fontSize: 14, color: 'gray', textAlign: 'center'}}>Você não fez nenhuma tarefa nesse dia.</Text>
    }else{
        flatlist =   <FlatList style={{maxHeight: 300, paddingTop: 10, paddingBottom: 0, height: 'auto'}}
                        data={this.state.detalhes}
                        renderItem={({ item, index }) =>{
                            return (
                            <View style={{marginBottom: 20, flexDirection: 'row', alignContent: 'center', alignItems: 'center'}}> 
                                <View style={{flexDirection: 'column'}}>
                                    <Text style={{color: 'gray', fontSize: 16, fontWeight: 'bold'}}>{item.nomeConteudo}</Text>
                                    <Text style={{color: 'gray', fontSize: 14, marginTop: -4}}>{item.nomeDisciplina}</Text>  
                                </View>    
                                <View style={{position: 'absolute', right: 0}}>    
                                    <Text style={{color: 'steelblue', fontSize: 24}}>{item.tempoTarefa}</Text>
                                </View>   
                            </View>  
                            )
                        }}
                        >
                    </FlatList>  
    }

    return (
      <View style={styles.container}> 
            <View style={{paddingBottom: 10}}>
                <Text style={{color: '#185c8f', fontWeight: 'bold'}}>Total: {this.state.tempoTotal}</Text>
                <Text style={{color: '#185c8f', fontWeight: 'bold'}}>Tarefas: {this.state.tempoTotalTarefas} ({this.state.porcentagemTarefas}%)</Text>
                <Text style={{color: '#185c8f', fontWeight: 'bold'}}>Revisões: {this.state.tempoTotalRevisoes} ({this.state.porcentagemRevisoes}%)</Text>
            </View>

            {this.state.isLoading == false ?

            <Timeline 
                renderFullLine={true}
                innerCircle={'dot'}
                columnFormat='two-column'
                onEventPress={this.verDetalhes}
                innerCircle={'icon'}
                style={{ flex: 1 }} 
                data={this.state.valueFormatter} 
                circleSize={25}
                circleColor='#fff'
                lineColor='rgb(45,156,219)'
                titleStyle={{marginTop: -8, color: '#185c8f'}}
                timeContainerStyle={{minWidth:20, marginTop: 2}}
                timeStyle={{textAlign: 'center', backgroundColor:'#185c8f', color:'white', paddingBottom: 2 ,paddingTop: 2, paddingLeft: 5, paddingRight: 5, borderRadius: 10, marginTop: 0}}
                descriptionStyle={{color:'gray', marginTop: 2}}
                detailContainerStyle={{marginBottom: 20,paddingTop: 3,paddingLeft: 8, paddingRight: 5, backgroundColor: "#BBDAFF", borderRadius: 8, color: '#185c8f', height: 'auto'}}
            />
        :

        <View style={{marginTop: 100}}>
            <ActivityIndicator size="large" color="steelblue" />
            <Text style={{color: 'steelblue', textAlign: 'center', marginTop: 4, fontSize: 18}}>Carregando</Text>
        </View>
        }    

         {/* -------- Modal dos detalhes --------------   */}
        <Modal keyboardTopOffset={0} coverScreen={true} style={[styles.modal, styles.modal3]} position={"center"} ref={"modal1"} isDisabled={this.state.isDisabled}>
                <View style={{alignItems: 'center'}}>
                     <Text style={{ color: 'steelblue', fontWeight: 'bold', fontSize: 24 }}>{this.state.dataTarefa}</Text>
                </View>
                <View style={{}}>
                    {flatlist}
                <View style={{alignItems: 'center'}}>    
                    <Button  onPress={() => this.refs.modal1.close()} small style={{ backgroundColor: 'steelblue', marginTop: 20, width: 'auto'}}>
                        <Text style={{fontSize: 13, textAlign: 'center', color: '#fff', paddingLeft: 15, paddingRight: 15}}>Fechar</Text>
                    </Button>
                </View>
            </View> 
        </Modal>
      </View>
    );
  }
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  modal: {
    justifyContent: 'center',
   
  },
  modal3: {
    height: 'auto',
    minHeight: 100,
    width: 'auto',
    maxWidth: '90%',
    padding: 15,
    borderRadius: 5
  },
});