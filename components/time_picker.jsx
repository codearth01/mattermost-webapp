// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import PropTypes from 'prop-types';
import React from 'react';
import Select from 'react-select';

export default class TimePicker extends React.PureComponent {
    static proptypes = {
        keyValue: PropTypes.string,
        defaultValue: PropTypes.string,
        submit: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.onSelectChange = this.onSelectChange.bind(this);
        this.state = {
            selectedOption: {value: this.props.defaultValue, label: this.props.defaultValue},
        };
        // eslint-disable-next-line react/prop-types
        // this.props.submit(this.props.key, this.state.selectedOption.value);
    }
    async onSelectChange(selectedOption) {
        this.setState({selectedOption}, async () => {
            // eslint-disable-next-line react/prop-types
            await this.props.submit(this.props.keyValue, selectedOption.label);
        });
    }

    render() {
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
        width: '150px',
        minHeight: '10px',
        textAlign: 'center',
    }),
};

