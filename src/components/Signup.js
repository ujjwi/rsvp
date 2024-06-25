import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const host = "http://localhost:5000";

    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
    const [displayPicture, setDisplayPicture] = useState(null);

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password } = credentials;

        // Create a FormData object
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (displayPicture) {
            formData.append('displayPicture', displayPicture);
        }

        const response = await fetch(`${host}/api/auth/createuser`, {
            method: "POST",
            body: formData,
        });

        const resp = await response.json();
        console.log(resp);

        if (resp.success) { // signUp successful
            // save the authToken and redirect
            localStorage.setItem('token', resp.authToken);
            localStorage.setItem('userId', resp.userId);
            navigate("/");
            alert('Account created successfully.');
        } else {
            alert('Unable to Sign Up! Try again.');
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const onFileChange = (e) => {
        setDisplayPicture(e.target.files[0]);
    }

    return (
        <div className='container'>
            <h2>Create an account to use RSVP</h2>
            <form onSubmit={handleSubmit}>
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
                    <input type="password" className="form-control" id="password" name='password' onChange={onChange} required minLength={5} />
                </div>
                <div className="mb-3">
                    <label htmlFor="cpassword" className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" id="cpassword" name='cpassword' onChange={onChange} required minLength={5} />
                </div>
                <div className="mb-3">
                    <label htmlFor="displayPicture" className="form-label">Display Picture</label>
                    <input type="file" className="form-control" id="displayPicture" name='displayPicture' onChange={onFileChange} />
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    )
}

export default Signup;
