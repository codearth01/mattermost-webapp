// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Select from 'react-select';

export default class TimePicker extends React.Component {
    static proptypes = {
        key: PropTypes.string,
        defaultValue: PropTypes.string,
        submit: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.state = {
            selectedOption: moment().format('LT'),
        };
    }
    onSelectChange(selectedOption) {
        this.setState({selectedOption});

        // this.props.submit(this.props.key, {selectedOption});
    }

    renderInput = (props) => {
        delete props.value;
        return (
            <div
                className='Select-input'
                style={{display: 'inline-block'}}
            >
                <input {...props}/>
            </div>
        );
    }

    render() {
        // eslint-disable-next-line react/prop-types

        return (
            <Select
                value={this.state.selectedOption}
                styles={customStyles}
                onChange={this.onSelectChange}
                options={this.props.options}
            />
        );
    }
}

const customStyles = {
    control: (base) => ({
        ...base,
        width: '100px',
        height: '30px',
        minHeight: '10px',
    }),
};

