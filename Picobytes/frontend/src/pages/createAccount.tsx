import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';




const AccountCreate = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();




    const handleCreation = async (e: any) => {
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
        } catch (err:any) {
            setError(err.message);
        }
    };    


    return(
        <div id='AccountCreation'>
            <h1 style={{marginBottom: '20px'}}>CREATE ACCOUNT</h1>
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
                    <button onClick={(e) => handleCreation(e)} id='btnCreateAcc'>CREATE ACCOUNT</button>
                </div>
            </div>
        </div>
    )
}

export default AccountCreate