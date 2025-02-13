 import React from 'react';
 import { useState } from 'react';
 import './login.css'

import './login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const login = (username: string, password: string) => {
        //will be changed to store to data base
        alert(username)
        alert(password)
    }
    

    return(
        <div id='Login'>
            <h1 style={{marginBottom: '20px'}}>LOGIN</h1>
            <div>
                <label>Username:</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} id='UsernameBox'></input>
            </div>
            <div>
                <label >Password:</label>
                <input type="password" value={password} onChange={(e)=> setPassword(e.target.value)} id='PasswordBox'></input>
            </div>
            <div id='ButtonSections'>
                <div>
                    <button onClick={() => login(username,password)} id='btnLogin'>LOGIN</button>
                </div>
                <div>
                    <button id='btnCreateAcc'>CREATE ACCOUNT</button>
                </div>
                

            </div>
        </div>
    )
}

export default Login
