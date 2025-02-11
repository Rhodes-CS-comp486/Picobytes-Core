//import React from 'react';


const Login = () => {
    
    return(
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'gray' }}>
            <h1 style={{marginBottom: '20px'}}>LOGIN</h1>
            <div>
                <label>Username:</label>
                <input id='UsernameBox' style={{backgroundColor: "white", color: "black", margin: '1em'}}></input>
            </div>
            <div>
                <label>Password:</label>
                <input id='PasswordBox' style={{backgroundColor: "white", color: "black", margin: '1em'}}></input>
            </div>
            <div style={{justifyContent: 'space-between'}}>
                <button>LOGIN</button>
                <button>CREATE ACCOUNT</button>
            </div>
        </div>
    )
}

export default Login
