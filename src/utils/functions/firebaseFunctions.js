import firebase from 'react-native-firebase';
import { getReviewPeriod } from '../functions/functions'

const firebaseDatabase = firebase.database();

export const login = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
        firebase.auth().onAuthStateChanged(user => {
            return user;
        })
    })        
}     

export const getUser = () => {
    const user = firebase.auth().currentUser;
    return user;
}

export const getProviderId = () => {
    firebase.auth().onAuthStateChanged(user => {
        return providerId = user.providerData[0].providerId
    })    
}

export const updateUserInfos = (uid, displayName, email, imageProfile , isMeta, tipoMeta, timeInput, isUserLogged) => {
    if (imageProfile !== null && !isMeta) {
        firebaseDatabase.ref('usuarios/' + uid + '/').update({
            'displayName': displayName,
            'imageProfile': imageProfile,
            'email': email,
            'notifications': true,
            'meta': isMeta,
            'tipoMeta': '',
            'tempoMeta': ''
        });
    } else if (isMeta) {
        firebaseDatabase.ref('usuarios/' + uid + '/').update({
            'displayName': displayName,
            'email': email,
            'notifications': true,
            'meta': true,
            'tipoMeta': tipoMeta,
            'tempoMeta': timeInput
          })
    } else if (isMeta && !isUserLogged ) {
        firebaseDatabase.ref('usuarios/' + uid + '/').update({
            'displayName': displayName,
            'email': email,
            'imageProfile': imageProfile,
            'notifications': true,
            'meta': isMeta,
            'tipoMeta': tipoMeta,
            'tempoMeta': timeInput
          })
    } else {
        firebaseDatabase.ref('usuarios/' + uid + '/').update({
            'displayName': displayName,
            'email': email,
            'notifications': true,
            'meta': isMeta,
            'tipoMeta': '',
            'tempoMeta': ''
        });
    }     
}

// --> Subjects

export const createNewSubject = (uid, nomeDisciplina, color) => {
    firebaseDatabase.ref('usuarios/' + uid + '/disciplinas/').push({
        nomeDisciplina,
        color
    });    
}

export const changeNameSubject = (uid, keyEditar, nomeEditar) => {
    firebaseDatabase.ref('usuarios/' + uid + '/disciplinas/' + keyEditar).update({
        "nomeDisciplina" : nomeEditar
      }).then(() => {
        firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyEditar).once('value', (snapshot) => {
          snapshot.forEach((doc) => {
            firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyEditar + '/' + doc.key).update({
              "nomeDisciplina" : nomeEditar
            })
          })
        }).then(() => {
            firebaseDatabase.ref('usuarios/' + uid + '/calendario/').once('value', (snapshot) => {
            snapshot.forEach((doc) => {
                firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + doc.key).orderByChild("keyDisciplina").equalTo(keyEditar).once('value', (snap) =>{
                snap.forEach((docs) => {
                    firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + doc.key + '/' + docs.key).update({
                    "nomeDisciplina" : nomeEditar
                  })
                })
              })
            })
          }).then(() => {
            firebaseDatabase.ref('usuarios/' + uid + '/finalizados/').once('value', (snapshot) => {
              snapshot.forEach((doc) => {
                firebaseDatabase.ref('usuarios/' + uid + '/finalizados/' + doc.key).orderByChild("keyDisciplina").equalTo(keyEditar).once('value', (snap) => {
                  snap.forEach((docs) => {
                    firebaseDatabase.ref('usuarios/' + uid + '/finalizados/' + doc.key + '/' + docs.key).update({
                      "nomeDisciplina" : nomeEditar
                    })
                  })
                })
              })
            })
          })
        })
    })
}

// --> Contents

export const uploadFile = async (uri, imageName, uid) => {
  return new Promise((resolve, reject) => {
    firebase.storage().ref('/' + uid + '/Documentos/' + imageName).put(uri).then(function (snapshot) {
      resolve(snapshot['downloadURL'])
    }).catch((error) => {
      reject(error)
    })
  })
}  

export const newContent = (URL, novoConteudo, tipo, uid, keyDisciplina, chosenDate, novoConteudo, nomeDisciplina, haveDocument, anotacoes, nomeArquivo) => {
  firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina).push({
    dataTarefa: chosenDate,
    nomeConteudo: novoConteudo,
    nomeDisciplina: nomeDisciplina,
    tempoTarefa: '00:00:00',
    tipo: tipo,
    status: tipo,
    keyHoje: '',
    temDocumento: haveDocument,
    urlDocumento: URL,
    anotacoes: anotacoes,
    nomeArquivo: nomeArquivo
  }).then((snap) => {
    const key = snap.key
    if (tipo !== 'arquivo') {
      firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + chosenDate + '/').push({ // adiciona o conteudo na tabela "HOJE"
        keyDisciplina: keyDisciplina,
        keyConteudo: key,
        dataTarefa: chosenDate,
        nomeConteudo: novoConteudo,
        nomeDisciplina: nomeDisciplina,
        tipo: tipo,
        status: tipo
      }).then((snap) => {
         //pega a key que foi inserida na tabela "HOJE" e atualiza na tabela dos conteudos
         firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + key).update({ //Atualiza o valor "keyHoje"
          'keyHoje': snap.key
        })
      })
    }
  })
}

export const deleteSubjectAndContents = (uid, keyDisciplina) => {
  firebaseDatabase.ref('usuarios/' + (uid) + '/conteudos/' + keyDisciplina).orderByChild('status').equalTo('aFazer').once('value', (snapshot) => { //vai pegar os conteudos que não estão concluidos e excluir
    snapshot.forEach((doc) => {
      const { dataTarefa, keyHoje } = doc.toJSON();

      firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + doc.key).remove();
      firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + dataTarefa + '/' + keyHoje).remove();
    })
  }).then(() => {
    firebaseDatabase.ref('usuarios/' + uid + '/disciplinas/' + keyDisciplina).remove();
  })
}

export const deleteContent = (uid, keyDisciplina, keyConteudo, data, keyHoje ) => {
  firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + keyConteudo).remove()
  .then(() => {
    firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + data + '/' + keyHoje).remove();
  })
}

export const deleteFile = (uid, keyDisciplina, keyConteudo, nomeArquivo) => {
  firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + keyConteudo).remove().then(() => {
    firebaseDatabase.ref(uid + '/Documentos/' + nomeArquivo).delete();
  });
}

// --> DetailActivities

export const resetTime = (uid, keyDisciplina, keyConteudo) => {
  firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' +  keyDisciplina + '/' + keyConteudo).update({ //Atualiza o valor "notifications"
    'tempoTarefa': '00:00:00',
    'status': 'aFazer'
  })
}

export const updateDetails = (uid, keyDisciplina, keyConteudo, keyHoje, dataTarefa, tempoTarefa) => {
  firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + keyConteudo).update({ //Atualiza o valor "tempoTarefa"
    'tempoTarefa': tempoTarefa,
    'status': 'Iniciado'
  }).then(() => {
    firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + dataTarefa + '/' + keyHoje).update({
    'status': 'Iniciado'
    })
  })
}

export const finishTasks = (state, temDocumento, tempoTarefa) => {
  const { uid, nomeArquivo, revisao, nomeDisciplina, nomeConteudo, keyDisciplina, dataAtual, urlDocumento, 
          anotacoes, keyHoje, dataTarefa, tipo, temDocumento, tempoTarefa, periodoRevisao, keyConteudo } = state;

  firebaseDatabase.ref('usuarios/' + uid + '/finalizados/' + dataAtual).push({
    keyDisciplina,
    nomeConteudo,
    nomeDisciplina,
    dataTarefa: dataAtual,
    tempoTarefa,
    tipo
  }).then(() => {
    if (revisao) { 
      const dataRevisao = getReviewPeriod(periodoRevisao, dataTarefa);

      firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina).push({ // cria uma revisão
        dataTarefa: dataRevisao,
        nomeConteudo,
        tempoTarefa: '00:00:00',
        tipo: 'revisao',
        keyHoje: '',
        nomeDisciplina,
        nomeArquivo,
        status: 'aFazer',
        temDocumento,
        urlDocumento,
        anotacoes
      }).then((snap) => {
        const key = snap.key;

        firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + dataRevisao + '/').push({ // adiciona a revisão na tabela "HOJE"
          keyDisciplina,
          keyConteudo: key,
          dataTarefa: dataRevisao,
          nomeConteudo,
          nomeDisciplina
        }).then((snap) => {
          const keyHoje = snap.key //pega a key que foi inserida na tabela "HOJE" e atualiza na tabela dos conteudos

          firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + key).update({ //Atualiza o valor "keyHoje"
            'keyHoje': keyHoje,
          })
        })
      })
    }}).then(() => {
    firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + dataTarefa + '/' + keyHoje).update({ //Atualiza o STATUS NA TABELA HJ
      'status': 'Concluido'
    });
    firebaseDatabase.ref('usuarios/' + uid + '/conteudos/' + keyDisciplina + '/' + keyConteudo).update({ //Atualiza o STATUS NA TABELA DISCIPLINA
      'status': 'Concluido',
      'tempoTarefa': tempoTarefa
    })
  })
}

// export const getTasks = (uid, currentDate) => { //Lista os conteudo para ser feito no dia atual 
//     const snapshots = []
//     firebaseDatabase.ref('usuarios/' + uid + '/calendario/' + currentDate).on('value', (snapshot) => { 
//          snapshots.push(snapshot.toJSON());
//     });

//     return snapshots
// }
