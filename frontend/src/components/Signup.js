import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Signup() {
    const host = "https://rsvp-backend-iwyf.onrender.com";

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
            toast.success("Account created successfully.");
        } else {
            toast.error("Unable to Sign Up! Try again.");
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const onFileChange = (e) => {
        setDisplayPicture(e.target.files[0]);
    }

    return (
        <>
        <section style={{"backgroundColor": "#EEE"}}>
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-lg-12 col-xl-11">
                    <div className="card text-black" style={{"marginTop": "50px"}}>
                    <div className="card-body p-md-5">
                        <div className="row justify-content-center">
                        <div className="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">

                            <p className="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>

                            <form className="mx-1 mx-md-4" onSubmit={handleSubmit}>

                            <div className="d-flex flex-row align-items-center mb-4">
                                <i className="fas fa-user fa-lg me-3 fa-fw"></i>
                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                <input type="text" id="name" name='name' className="form-control" onChange={onChange} />
                                <label className="form-label" htmlFor="name">Your Name</label>
                                </div>
                            </div>

                            <div className="d-flex flex-row align-items-center mb-4">
                                <i className="fas fa-envelope fa-lg me-3 fa-fw"></i>
                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                <input type="email" id="email" name='email' className="form-control" onChange={onChange} />
                                <label className="form-label" htmlFor="email">Your Email</label>
                                </div>
                            </div>

                            <div className="d-flex flex-row align-items-center mb-4">
                                <i className="fas fa-lock fa-lg me-3 fa-fw"></i>
                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                <input type="password" id="password" name='password' className="form-control" onChange={onChange} />
                                <label className="form-label" htmlFor="password">Password</label>
                                </div>
                            </div>

                            <div className="d-flex flex-row align-items-center mb-4">
                                <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                <input type="password" id="cpassword" name='cpassword' className="form-control" onChange={onChange} />
                                <label className="form-label" htmlFor="cpassword">Repeat your password</label>
                                </div>
                            </div>

                            <div className="d-flex flex-row align-items-center mb-4">
                                <i className="fas fa-key fa-lg me-3 fa-fw"></i>
                                <div data-mdb-input-init className="form-outline flex-fill mb-0">
                                <input type="file" id="displayPicture" name='displayPicture' className="form-control" onChange={onFileChange} />
                                <label className="form-label" htmlFor="displayPicture">Upload your display picture</label>
                                </div>
                            </div>

                            {/* <div className="form-check d-flex justify-content-center mb-5">
                                <input className="form-check-input me-2" type="checkbox" value="" id="form2Example3c" />
                                <label className="form-check-label" htmlFor="form2Example3">
                                I agree all statements in <a href="#!">Terms of service</a>
                                </label>
                            </div> */}

                            <div className="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                                <button  type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-lg">Register</button>
                            </div>

                            </form>

                        </div>
                        <div className="col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">

                            <img src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-registration/draw1.webp"
                            className="img-fluid" alt="Sample image" />

                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
        </section>
        </>
    )
}

export default Signup;
