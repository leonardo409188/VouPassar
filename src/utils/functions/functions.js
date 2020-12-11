import FBSDK, { GraphRequest, AccessToken, GraphRequestManager } from 'react-native-fbsdk';
import { messages, errorCodes } from '../constants';
import moment from 'moment';

export const checkInputsLogin = (email, password) => {
    if (email === null || password === null || email === "" || password === "") {
        return false;
    } else {
        return true;
    }
}

export const checkInputsSignUp = (email, password, passwordConfirm, displayName) => {
    if (password === passwordConfirm && email.includes("@") && email.includes(".com") && 
         displayName !== '' && (password && passwordConfirm) !== '') {
            return true;
    } else {
         return false;
    }
}

export const getMessageModal = (type) => {
    const messagesModal = {
        [errorCodes.emailInUse]: messages.emailInUse,
        [errorCodes.unknown]: messages.error,
        [errorCodes.weakPassword]: messages.weakPassword,
        [errorCodes.wrongPassword]: messages.wrongPassword,
        [errorCodes.accountExists] : messages.emailInUse,
        [errorCodes.invalidEmail] : messages.invalidEmail
    }

    return messagesModal[type];
}

export const typeGoal = (value) => {
    if (value === 0) {
        return 1;
    } else if (value === 1) {
        return 7;
    } else if (value === 2) {
      const meta = calcDaysUntilEndOfMonth();
      return meta;
    }
}

// Calcula quantos dias falta até o fim do mês
function calcDaysUntilEndOfMonth() {
    var today = new Date();
    var month = today.getMonth();
    var days = (daysInMonth(month + 1, today.getFullYear()))
    return days;
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

export const calcGoal = (text, value) => {
    var a = text.split(':'); 
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
    var milliseconds = seconds * 1000;

    // pega os milliseconds e divide pela quantidade de dias dependendo da meta (diária, semanal, mensal)
    const result = (milliseconds / value);

    const hours = msToTime(result);
    return hours;  
}

//converte para hh:mm:ss
function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + 'hrs ' + mins + 'min ' + secs + 'seg';
}

export const getCurrentDate = (type) => {
  const date = ("0" + new Date().getDate()).slice(-2)  // Current Date
  const month = new Date().getMonth() + 1; // Current Month
  const year = new Date().getFullYear(); // Current Year

  if (type) {
    return (date + '-' + month + '-' + year);
  } else {
    return (date + '/' + month + '/' + year);
  }
}

export const getRandomColor = () => { //gera uma cor aleatória
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export const getMillieseconds = (tempoTarefa) => {
  var a = tempoTarefa.split(':');  // split it at the colons
  var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);  // minutes are worth 60 seconds. Hours are worth 60 minutes.
  return (seconds * 1000);
}

export const getMilliesecondsToDate = (millisec) => {
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

export const getReviewPeriod = (periodoRevisao, dataTarefa) => {
  var data;
  if (periodoRevisao === 7 || periodoRevisao === 15) {  
     data = moment(dataTarefa, 'dd-mm-yyyy').add('days', periodoRevisao);
  } else {  
     data = moment(dataTarefa, 'dd-mm-yyyy').add('month', 1);
  }
  return dataRevisao = moment(data).format('DD-MM-YYYY');
}

export const getDaysRemaining = (tipoMeta) => {
  const dados = []

  if (tipoMeta === 'diaria') {
    const startDate = moment().startOf('day').toDate();
    const endDate   = moment().endOf('day').toDate();
    const daysRemaining = 1;

    dados.push({ daysRemaining, startDate, endDate });

  } else if (tipoMeta === 'semanal') {
    const startDate = moment().startOf('week').toDate();
    const endDate   = moment().endOf('week').toDate();

    var now = moment(new Date()); 
    var end = moment().endOf('week').toDate();
    var duration = moment.duration(now.diff(end));
    var a = duration.asDays().toFixed(0);
    const daysRemaining = a.split('-');

    dados.push({ daysRemaining, startDate, endDate });

  } else if (tipoMeta === 'mensal') {
    const startDate = moment().startOf('month').toDate();
    const endDate   = moment().endOf('month').toDate();

    var date = new Date();
    var time = new Date(date.getTime());
    time.setMonth(date.getMonth() + 1);
    time.setDate(0);
    const daysRemaining  = time.getDate() > date.getDate() ? time.getDate() - date.getDate() : 0; 

    dados.push({ daysRemaining, startDate, endDate });
  }

  return dados;
}

export const getAllDates = function(startDate, endDate) {
  const dates = [],
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

export const getFacebookImage = () => {
    try {
        const currentAccessToken =  AccessToken.getCurrentAccessToken()
        const graphRequest = new GraphRequest('/me', {
          accessToken: currentAccessToken.accessToken,
          parameters: {
            fields: {
              string: 'picture.type(large)',
            },
          },
        }, (error, result) => {
          if (error) {
            throw error;
          } else {
            return result.picture.data.url;
          }
        })

        new GraphRequestManager().addRequest(graphRequest).start()
      } catch (error) {
        return error;
      }
  }
