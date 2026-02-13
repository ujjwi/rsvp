import React from 'react';

function About() {
  return (
    <div className="page-wrapper page-about">
      <div className="about-card">
        <h1 className="about-title">About RSVP</h1>
        <p className="about-subtitle">
          RSVP - "Respond, if you please" is an event attendance app built with the MERN stack.
        </p>
        <p className="about-text">
          Create events, invite others, and keep track of who's attending. Sign up to host your own events
          or browse upcoming events and RSVP to join.
        </p>
        <div className="about-getting-started">
          <h3>Getting started</h3>
          <p>Create an account, then create events or browse the home page to find events you'd like to attend.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
