import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from "../config";
import { AuthContext } from "../context/AuthContext";

function Signup() {
    const { login } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", cpassword: "" });
    const [displayPicture, setDisplayPicture] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, cpassword } = credentials;

        if (password !== cpassword) {
            toast.error("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            if (displayPicture) {
                formData.append('displayPicture', displayPicture);
            }

            const response = await fetch(`${API_BASE_URL}/api/auth/createuser`, {
                method: "POST",
                body: formData,
            });

            const resp = await response.json();

            if (resp.success) {
                login({ token: resp.authToken, userId: resp.userId });
                navigate("/");
                toast.success("Account created successfully.");
            } else {
                const msg = resp.error || (Array.isArray(resp.errors) && resp.errors[0]?.msg) || "Unable to Sign Up! Try again.";
                toast.error(msg);
            }
        } catch (error) {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const onChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    }

    const onFileChange = (e) => {
        setDisplayPicture(e.target.files[0]);
    }

    return (
        <div className="page-wrapper auth-page">
            <div className="container">
                <div className="auth-card">
                    <h1>Sign up</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input type="text" id="name" name="name" className="form-control" placeholder="Your name" value={credentials.name} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" className="form-control" placeholder="your@email.com" value={credentials.email} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" name="password" className="form-control" placeholder="••••••••" value={credentials.password} onChange={onChange} required minLength={5} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="cpassword">Confirm password</label>
                            <input type="password" id="cpassword" name="cpassword" className="form-control" placeholder="••••••••" value={credentials.cpassword} onChange={onChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="displayPicture">Profile picture (optional)</label>
                            <input type="file" id="displayPicture" name="displayPicture" className="form-control" onChange={onFileChange} accept="image/jpeg,image/png,image/jpg" />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? "Creating account..." : "Register"}
                        </button>
                    </form>
                    <div className="auth-footer">
                        <p className="mb-0">
                            Already have an account? <Link to="/login">Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup;
