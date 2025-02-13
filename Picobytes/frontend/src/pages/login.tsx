 //import React from 'react';

import './login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
  
    const homepage = () => {
        navigate('/homepage'); // Navigate to the login page
    };
    
    return(

        <div className='login-container'>
            <h1 className='login'>LOGIN</h1>
            <div className='login-container-input'>
                <div className='login-container-input-button'>
                    <label>Username:</label>
                    <input id='UsernameBox' className='login-input-button'></input>
                </div>

                <div className='login-container-input-button'>
                    <label>Password:</label>
                    <input id='PasswordBox' className='login-input-button'></input>
                </div>
            </div>
            <div className='login-button-container'>
                <button onClick={homepage}>LOGIN</button>
                <button>CREATE ACCOUNT</button>
            </div>
        </div>
    )
}

export default Login
// log in page (possibly with OneLogin)

//main
