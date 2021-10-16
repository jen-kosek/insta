import React from 'react';
import ReactDOM from 'react-dom';
import Page from './page';

// This method is only called once
ReactDOM.render(
    // Insert the post component into the DOM
    <Page url="/api/v1/posts/" />,
    document.getElementById('reactEntry'),
);
