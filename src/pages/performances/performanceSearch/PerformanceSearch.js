import React, { Component } from 'react';
import {  StyleSheet, View, FlatList } from 'react-native';
import { Text, Input, Item } from 'native-base';
import Highlighter from 'react-native-highlight-words';
import firebase from 'react-native-firebase';
import moment from 'moment';
import 'moment/locale/pt-br';
import AndroidKeyboardAdjust from 'react-native-android-keyboard-adjust';
import { getUser, getCurrentDate, getMillieseconds, getMilliesecondsToDate } from '../../../utils/functions'

AndroidKeyboardAdjust.setAdjustNothing();

export default class PerformanceSearch extends Component {
    constructor(props) {
      super(props);
      this.state = {
        dados: [],
        tempoTotalConvertido: 0,
        text: '',
      };
    }  

    componentDidMount(){
      const user = getUser();
      const { uid } = user;
      const currentDate = getCurrentDate(true);

      this.setState({ uid, currentDate, chosenDate: currentDate });
    }
 
    searchText = async (searchText) => {
      this.setState({ text: searchText }, () => {
        if (searchText !== '') {
          this.search(searchText);
        }
      })
    }   
    
    search(searchText) {       
      this.setState({ isLoading: true });

      const dados = [];
      var count = 0
      var tempoTotal = 0
       
      firebase.database().ref('usuarios/' + this.state.uid + '/finalizados/').on('value',  (snapshot) => {
        if (snapshot.val() !== null) {
          const param = ['nomeDisciplina', 'nomeConteudo'];

          param.forEach(text => {
            snapshot.forEach(element => {
              firebase.database().ref('usuarios/' + this.state.uid + '/finalizados/' + element.key).orderByChild(text).startAt(searchText).endAt(searchText + "\uf8ff").on('value',  (snap) => {
                if (snap.val() !== null) {
                  snap.forEach(element => {
                    const { tempoTarefa, nomeDisciplina, nomeConteudo, dataTarefa } = element.toJSON();
                  
                    var tempoTarefaPlus = getMillieseconds(tempoTarefa);     
                    tempoTotal = tempoTotal  += tempoTarefaPlus
                    count++  

                    const myMoment = moment(dataTarefa, 'DD-MM-YYYY');
                    const dataFormatada = moment(myMoment).format('DD/MM/YYYY', 'fr'); 

                    dados.push({
                        nomeDisciplina, nomeDisciplina, tempoTarefa, dataFormatada, nomeConteudo
                    });        
                  })
                }
            })
          })
        });
      }  
    }); 

    const tempoTotalConvertido = getMilliesecondsToDate(tempoTotal); 
    
    this.setState({ dados, count, tempoTotalConvertido });    
  }

  render() {
    const { count, novoConteudo } = this.state;
    var view;

    if (count === 0) {
      view = <Text style={{marginTop: 15, fontSize: 16, textAlign: 'center', color: 'gray'}}>Pesquisa não encontrada.</Text>
                    
    } else if (count === null) {
      view = <Text style={{marginTop: 15, fontSize: 16, textAlign: 'center', color: 'gray'}}>Pesquise por alguma Disciplina  {'\n'}ou Tarefa.</Text>           
    } else {
      view =  <View style={{backgroundColor: '#fff', width: '100%', padding: 10, borderRadius: 10, marginTop: 10}}>
                <Text style={{color: 'gray', textAlign: 'center', fontWeight: 'bold', marginBottom: 5}}>Tempo Total: {this.state.tempoTotalConvertido}</Text>    
                <FlatList style={{ paddingTop: 10}}
                    data={this.state.dados}
                    renderItem={({ item, index }) =>{
                        
                        return (
                        <View style={{marginBottom: 20, flexDirection: 'row', alignContent: 'center', alignItems: 'center'}}> 
                            <View style={{flexDirection: 'column'}}>
                                <Highlighter
                                    style={{color: 'gray', fontWeight: 'bold', fontSize: 13}}
                                    highlightStyle={{backgroundColor: 'yellow'}}
                                    searchWords={[this.state.novoConteudo]}
                                    textToHighlight={item.nomeDisciplina}
                                /> 
                                  <Highlighter
                                    style={{color: 'gray', fontWeight: 'bold', fontSize: 12}}
                                    highlightStyle={{backgroundColor: 'yellow'}}
                                    searchWords={[this.state.novoConteudo]}
                                    textToHighlight={item.nomeConteudo}
                                />   
                                <Text style={{color: 'gray', fontSize: 12}}>{item.dataFormatada}</Text>  
                            </View>    
                            <View style={{position: 'absolute', right: 0}}>    
                                <Text style={{color: 'steelblue', fontSize: 20}}>{item.tempoTarefa}</Text>
                            </View>   
                        </View>  
                        )
                    }}
                    keyExtractor={item => item.key}
                    >
                </FlatList> 
            </View>
    }
    return (
        <View style={styles.container}>
            <View style={{borderRadius: 10,backgroundColor: '#fff',flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center', padding: 10, borderBottomColor: "#e0e0e0", borderBottomWidth: 1}}>
                <Item rounded style={{ borderColor: 'gray', paddingLeft: 10, height: 35, width: '100%' }}>
                     <Input Textbox placeholder="Pesquisar..." onChangeText={text => this.searchText(text)}
                        style={{color: 'gray', fontSize: 15}}
                        placeholderTextColor="gray"
                        value={novoConteudo}/>
                </Item>  
            </View> 
           
             {view} 
            
       </View>
   
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
      backgroundColor: '#f0f0f0',
      paddingBottom: 85
    },
  });