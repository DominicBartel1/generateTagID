import ProgressBar from 'react-bootstrap/ProgressBar'
import React, { useState, useEffect } from 'react';
import "./loadBar.css"
export class LoadBar extends React.Component {



    render() {
        let progressArray = []
        for (var type in this.props.data.loadBars) {
            progressArray.push(<ProgressBar animated now={this.props.percent} label={this.props.storedString} />)
        }
        return <div id="divContainer" style={{ display: this.props.data.show ? "" : "none" }}>
            <div id="progBar">
                {progressArray}
            </div>
        </div>
    }
}