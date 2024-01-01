import { range } from "lodash";
import { Component, createRef } from "react";
import PropTypes from 'prop-types';
import Bubble from "./Bubble";
import styles from './style.module.css';

export default class Timesheet extends Component {

    constructor(props) {
        super(props);
        this.state = {
            yearWidth: 50
        }
        this.mainDivRef = createRef();
        this.ulRef = createRef();
        this.yearsCount = 1;
        this.colorCycle = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];
    }


    componentDidMount() {
        const currentMainDiv = this.mainDivRef.current;
        const currentUl      = this.ulRef     .current;
        this.setState({ yearWidth: Math.round( this.state.yearWidth / currentUl.offsetWidth * currentMainDiv.offsetWidth ) }) ;
    }

    render() {
        const fromYear = Math.min( (new Date()).getFullYear(), ...this.props.data.map(d => d.from.getFullYear() ) );
        const toYear =   Math.max( (new Date()).getFullYear(), ...this.props.data.map(d => d.to  .getFullYear() ) ) + 1;
        this.yearsCount = toYear - fromYear;

        return <div className={styles.mainDiv} ref={this.mainDivRef}>
            <div className={styles.scale}>
                {range(fromYear, toYear + 1).map(y => <section key={y} style={{width: this.state.yearWidth + "px" }}>{y}</section>)}
            </div>
            <ul className={styles.bubbles} ref={this.ulRef}>
                {this.props.data.map((d, i) => <Bubble key={i} data={d} yearWidth={this.state.yearWidth} fromYear={fromYear} color={this.colorCycle[i % this.colorCycle.length]} />)}
            </ul>
        </div>
    }
}

Timesheet.propTypes = {
    data: PropTypes.array
};


Timesheet.defaultProps = {
    data: []
};