import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function GoogleCalendarIntegration() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('googleAccessToken');

    if (accessToken) {
      // Load the Google API client and set the access token
      gapi.load('client', () => {
        gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY, // Your Google API key
            discoveryDocs: [
              'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            ],
          })
          .then(() => {
            // Set the access token for gapi requests
            gapi.client.setToken({ access_token: accessToken });
          })
          .catch((error) => {
            console.error('Error initializing Google API client:', error);
          });
      });
    }
  }, []);

  const addEventToCalendar = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    // create an object for the event
    const event = {
      summary: 'New Event from Datepicker',
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'America/Los_Angeles', // Adjust time zone as needed
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'America/Los_Angeles',
      },
    };

    // insert this event into the google calendar
    gapi.client.calendar.events
      .insert({
        calendarId: 'primary',
        resource: event,
      })
      .then((response) => {
        alert('Event added to Google Calendar!');
        'Event created:', response;
      })
      .catch((error) => {
        console.error('Error adding event:', error);
        alert('Failed to add event to Google Calendar.');
      });
  };

  return (
    <div>
      <h2>Select Start Date and End Date</h2>
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        placeholderText="Select start date"
      />
      <DatePicker
        selected={endDate}
        onChange={(date) => setEndDate(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        placeholderText="Select end date"
      />
      <button onClick={addEventToCalendar}>Add to Google Calendar</button>
    </div>
  );
}

export default GoogleCalendarIntegration;

// process.env.REACT_APP_GOOGLE_CALENDAR_API_KEY
