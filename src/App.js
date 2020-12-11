import { createSwitchNavigator, createAppContainer } from 'react-navigation'
// import the different screens
import SplashScreen from './pages/splashScreen/SplashScreen'
import SignUp from './pages/signUp/SignUp'
import Login from './pages/login/Login'
import Main from './Main'
import EmailVerification from './pages/emailVerification/EmailVerification'
import ForgetPassword from './ForgetPassword'
import Home from './pages/home/Home'
import ChangeName from './configurations/ChangeName'
import Contents from './pages/contents/Contents'
import ChangePassword from './configurations/ChangePassword'
import ChangeEmail from './configurations/ChangeEmail'
import DetailsActivities from './pages/detailsActivities/DetailsActivities'
import Configurations from './add/Configurations'
import PerformanceSettings from './pages/performanceSettings/PerformanceSettings'
import Custom from './performance/Custom'
import performance from './add/Performance'

// create our app’s navigation stack
export default createAppContainer(createSwitchNavigator(
  {
    SplashScreen,
    SignUp,
    Login,
    Main,
    EmailVerification,
    ForgetPassword,
    Home,
    ChangeName,
    Contents,
    ChangePassword,
    ChangeEmail,
    DetailsActivities,
    Configurations,
    PerformanceSettings,
    Custom,
    performance,
  },
  
  {
    initialRouteName: 'Main'
  }
));
