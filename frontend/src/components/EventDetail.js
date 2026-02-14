import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventContext } from '../context/EventContext';
import Event from './Event';
import { toast } from 'react-toastify';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEventById } = useContext(EventContext);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setEventData(null);
      const data = await getEventById(id);
      setEventData(data);
      setLoading(false);
    };

    if (id) {
      fetchEvent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container text-center">
          <div className="spinner-border text-light spinner-home" role="status" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (!eventData) {
    toast.error('Event not found');
    navigate('/');
    return null;
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <button
          type="button"
          className="btn btn-link text-light mb-3 p-0"
          onClick={() => navigate(-1)}
          style={{ textDecoration: 'none' }}
        >
          ← Back
        </button>
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <Event event={eventData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
