import './App.css';
import 'antd/dist/antd.css';
import Sidebar from './components/sidebar';
import MainView from './components/mainView';

const App = () => {
  return (
    <div className="mainContainer">
      <Sidebar />
      <MainView />
    </div>
  )
}

export default App;
