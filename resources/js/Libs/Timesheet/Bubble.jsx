import { Component } from "react";
import PropTypes from 'prop-types';


export default class Bubble extends Component {

    constructor(props) {
        super(props);
    }

    getYearsDistanceFromBegin( date ) {
        let actualDate = date;
        if( actualDate > new Date() && this.props.limitToToday )
            actualDate = new Date();
        let yearsDifference = actualDate.getFullYear() - this.props.fromYear;
        let daysDifference = ( actualDate - new Date(actualDate.getFullYear(), 0, 0) ) / 1000 / 60 / 60 / 24;
        return yearsDifference + daysDifference / 365.0
    }

    getStartOffset() {
        return Math.round( this.props.yearWidth * this.getYearsDistanceFromBegin( this.props.data.from ) )
    }

    getWidth() {
        return Math.round( this.props.yearWidth * ( this.getYearsDistanceFromBegin( this.props.data.to ) - this.getYearsDistanceFromBegin( this.props.data.from ) ) )
    }

    render() {
        return <li>
            <span style={ {marginLeft: this.getStartOffset() + "px", width: this.getWidth() + "px", backgroundColor: this.props.color } }></span>
            <p>{this.props.data.label}</p>
        </li>
    }
}

Bubble.propTypes = {
    data: PropTypes.object.isRequired,
    yearWidth: PropTypes.number.isRequired,
    fromYear: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    limitToToday: PropTypes.bool
};

Bubble.defaultProps = {
    limitToToday: false
}