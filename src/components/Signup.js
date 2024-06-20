import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'

function Signup() {
    const host = "http://localhost:5000";

    const[credentials, setCredentials] = useState({name:"", email:"", password:"", cpassword:""})

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {name, email, password} = credentials;
        const response = await fetch(`${host}/api/auth/createuser`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({name, email, password}),
        });
    
        const resp = await response.json();
        console.log(resp);

        if(resp.success) { // signUp successful
            // save the authToken and redirect
            localStorage.setItem('token', resp.authToken);
            navigate("/");
            // props.showAlert("Account created successfully.", "success");
            alert('Account created successfully.');
        }
        else {
            // props.showAlert("Unable to Sign Up! Try again.", "danger");
            alert('Unable to Sign Up! Try again.');
        }
    }

    const onChange = (e) => {
        setCredentials({...credentials, [e.target.name]: e.target.value});
    }

  return (
    <div className='container'>
        <h2>Create an account to use RSVP</h2>
        <form onSubmit={handleSubmit}>
        {/* Whenever the form is submitted, the handleSubmit function runs */}
            <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type="text" className="form-control" id="name" name='name' onChange={onChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="email" className="form-label">Email address</label>
                <input type="email" className="form-control" id="email" name='email' onChange={onChange} aria-describedby="emailHelp" />
                <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input type="password" className="form-control" id="password" name='password' onChange={onChange} requird minLength={5} />
            </div>
            <div className="mb-3">
                <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                <input type="password" className="form-control" id="cpassword" name='cpassword' onChange={onChange} requird minLength={5} />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    </div>
  )
}

export default Signup
