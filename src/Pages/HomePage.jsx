import Button from 'react-bootstrap/Button';
import Sidebar from '../Componetnts/Sidebar';
import MenuPage from '../Componetnts/MenuPage';

const HomePage=()=> {
  return(
    <>
 <div className='container'>
    <div className="row">
        <div>
            <Sidebar/>
        </div>
        <div>
            <MenuPage/>
        </div>
    </div>
   
 </div>
   
    </>
  )
}

export default  HomePage;