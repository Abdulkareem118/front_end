import 'antd/dist/reset.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import HomePage from './Pages/HomePage';
import ItemsPage from './Pages/ItemsPage';
import DailyExpensies from './Componetnts/DailyExpensies';
import HistoryPage from './Pages/HistoryPage';


function App() {
 

  return (
    <>
     <Toaster position="top-center" />
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoginPage/>} />
      <Route path='/Register' element={<RegisterPage/>} />
      <Route  path='/Home' element={<HomePage/>} />
      <Route path='/Items' element={<ItemsPage/>}/>
      <Route path='/Bills' element={<DailyExpensies/>}/>
      <Route path='/History' element={<HistoryPage/>}/>
    </Routes>
    
    </BrowserRouter>

    </>
  )
}

export default App
