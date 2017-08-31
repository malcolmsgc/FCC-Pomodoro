import Pomodoro from "./components/Pomodoro";
// require ("modernizr");
import "../scss/app.scss";
import 'normalize.css';


const pomodoro = new Pomodoro(25, 5, 5999); //args are work mins, break mins, ceiling in seconds
pomodoro.init();