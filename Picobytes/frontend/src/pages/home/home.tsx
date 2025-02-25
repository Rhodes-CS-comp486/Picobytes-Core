
import Home_Top_Content from './home_top_content';
import Home_Bot_Content from './home_bot_content';
import Home_Header from './home_header';



import './home.css'


const Homepage = () => {
  


  return (
    <div className='homepage'>
      
      {/* Profile Icon & header */}
      {<Home_Header/>}
      <div className='homepage-content-container'>
        {<Home_Top_Content/>}
        {<Home_Bot_Content/>}
      </div>
      
    </div>
        
  );
};

export default Homepage;