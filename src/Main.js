
import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Icon } from 'native-base';
import FontAewsome5 from 'react-native-vector-icons/FontAwesome5';
import Inicio from './pages/home/Home';
import Subjects from './pages/subjects/Subjects'
import Performance from './pages/performances/performanceHome/PerformanceHome'
import Conta from './add/Configurations'
import Calendar from './pages/calendar/Calendar'

let IconComponent = FontAewsome5;

const TabScreen = createMaterialTopTabNavigator(
  {
    Inicio: {
      screen: Inicio,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          //Your icon component for example => 
          <Icon style={{ color: tintColor, textAlign: 'center', fontSize: 30 }} name="ios-home" />
        )
      },
    },

    Subjects: {
      screen: Subjects,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          //Your icon component for example => 
          <Icon name="ios-book"
            size={26}
            style={{ color: tintColor, textAlign: 'center', fontSize: 30 }} />
        )
      },
    },
    Calendário: {
      screen: Calendar,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          //Your icon component for example => 
          <Icon name="md-calendar"
            size={24}
            style={{ color: tintColor, textAlign: 'center', fontSize: 30 }} />
        )
      },
    },
    Desempenho: {
      screen: Performance,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          //Your icon component for example => 
          <IconComponent name="chart-line"
            size={24}
            style={{ color: tintColor, textAlign: 'center', fontSize: 27 }} />
        )
      },
    },
    Conta: {
      screen: Conta,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          //Your icon component for example => 
          <Icon name="ios-person"
            style={{ color: tintColor, textAlign: 'center', fontSize: 30 }} />
        )
      },
    },
  },
  {
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    lazy: true,
    animationEnabled: true,
    tabBarOptions: {
      showIcon: true,
      activeTintColor: '#279bce',
      inactiveTintColor: '#bdc3c7',
      tabStyle: {
        borderTopWidth: .3,
        borderTopColor: '#bdc3c7',
        height: 55,
        paddingTop: 0,
        paddingBottom: 0
      },
      style: {
        backgroundColor: '#fffff',
      },

      renderIndicator: () => null,
      showLabel: false,
    },
  },
);


//making a StackNavigator to export as default
const App = createStackNavigator({
  TabScreen: {
    screen: TabScreen,
    navigationOptions: {
      header: null,
      title: 'TabExample',
    },
  },
});
export default createAppContainer(App);