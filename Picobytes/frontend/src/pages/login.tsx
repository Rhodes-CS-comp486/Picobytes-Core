 import React from 'react';
 import { useState } from 'react';
 import './login.css'
import { useNavigate } from 'react-router-dom';

const Login = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e: any) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uname: username, upassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            setUserId(data.uid);
            setError(null);

            if(data.uid > 0){
                navigate('/homepage');
            }

        } catch (err:any) {
            setError(err.message);
        }
    };

    const login = (username: string, password: string) => {
        //will be changed to store to data base
        alert(username)
        alert(password)
        fetch("localhost:5173/api/login").then()
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
                    <button onClick={(e) => handleLogin(e)} id='btnLogin'>LOGIN</button>
                </div>
                <div>
                    <button id='btnCreateAcc'>CREATE ACCOUNT</button>
                </div>
                

            </div>
        </div>
    )
}

export default Login
