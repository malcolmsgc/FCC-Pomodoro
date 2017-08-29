import Pomodoro from "./components/Pomodoro";
// require ("modernizr");
import "../scss/app.scss";
import 'normalize.css';


const pomodoro = new Pomodoro(25, 5);
pomodoro.init();