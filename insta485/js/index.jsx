import React from 'react';
import PropTypes from 'prop-types';

class Posts extends React.Component {
    constructor(props) {
        // Initialize mutable state
        super(props);
        this.state = { url: '', postids: [], numposts: 0 };
    }

    componentDidMount() {
        // This line automatically assigns this.props.url to the const variable url
        const { url } = this.props;

        // Call REST API to get the post's information
        fetch(url, { credentials: 'same-origin' })
        .then((response) => {
            if (!response.ok) throw Error(response.statusText);
            return response.json();
        })
        .then((data) => {
            this.setState({
                postids[prevState.numposts]: data[prevState.numposts],
                numposts: prevState.numposts++
            });
        })
        .catch((error) => console.log(error));
    }

    get_posts(){
        return (<p>{this.state.list.map(item => (
            <li key={item}>{item}</li>
          ))}</p>)
    }

    redner(){
        return (<div> {this.get_posts} </div>
        )
    }
}