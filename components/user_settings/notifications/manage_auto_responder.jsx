// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import moment from 'moment';

import AutosizeTextarea from 'components/autosize_textarea.jsx';
import SettingItemMax from 'components/setting_item_max.jsx';
import {localizeMessage} from 'utils/utils.jsx';
import TimePicker from 'components/time_picker.jsx';

const MESSAGE_MAX_LENGTH = 500;

export default class ManageAutoResponder extends React.PureComponent {
    static propTypes = {
        isOooStatusDropdown: PropTypes.bool,
        autoResponderActive: PropTypes.bool.isRequired,
        autoResponderMessage: PropTypes.string.isRequired,
        updateSection: PropTypes.func.isRequired,
        setParentState: PropTypes.func.isRequired,
        submit: PropTypes.func.isRequired,
        saving: PropTypes.bool.isRequired,
        error: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.handleFromChange = this.handleFromChange.bind(this);
        this.handleToChange = this.handleToChange.bind(this);
        this.state = {
            from: null,
            isFromChanged: false,
            to: null,
            isToChanged: false,
        };
    }

    static defaultProps = {
        isOooStatusDropdown: false,
    };

    handleAutoResponderChecked = (e) => {
        this.props.setParentState('autoResponderActive', e.target.checked);
    };

    onMessageChanged = (e) => {
        this.props.setParentState('autoResponderMessage', e.target.value);
    };

    handleTimeChange = (e) => {
        this.props.setParentState(e.target.key, e.target.value);
    }

    showFromMonth() {
        const {from, to} = this.state;
        if (!from) {
            return;
        }
        if (moment(to).diff(moment(from), 'months') < 2) {
            this.to.getDayPicker().showMonth(from);
        }
    }

    handleFromChange(from) {
        // Change the from date and focus the "to" input field
        this.setState({from});
        this.props.setParentState('fromDate', this.from.getInput().value);

        // this.setState({isFromChanged: true});
    }

    handleToChange(to) {
        this.setState({to}, this.showFromMonth);
        this.props.setParentState('toDate', this.to.getInput().value);

        // this.setState({isToChanged: true});
    }

    render() {
        const {
            autoResponderActive,
            autoResponderMessage,
        } = this.props;
        let serverError;
        if (this.props.error) {
            serverError = <label className='has-error'>{this.props.error}</label>;
        }

        const inputs = [];
        if (autoResponderActive) {
            this.props.setParentState('autoResponderActive', true);
        }
        let activeToggle = (
            <div
                id='autoResponderCheckbox'
                key='autoResponderCheckbox'
                className='checkbox'
            >
                <label>
                    <input
                        id='autoResponderActive'
                        type='checkbox'
                        checked={autoResponderActive}
                        onChange={this.handleAutoResponderChecked}
                    />
                    <FormattedMessage
                        id='user.settings.notifications.autoResponderEnabled'
                        defaultMessage='Enabled'
                    />
                </label>
            </div>
        );

        activeToggle = this.props.isOooStatusDropdown ? null : activeToggle;
        const message = (
            <div
                id='autoResponderMessage'
                key='autoResponderMessage'
            >
                <div className='padding-top'>
                    <AutosizeTextarea
                        style={{resize: 'none'}}
                        id='autoResponderMessageInput'
                        className='form-control'
                        rows='5'
                        placeholder={localizeMessage('user.settings.notifications.autoResponderPlaceholder', 'Message')}
                        value={autoResponderMessage}
                        maxLength={MESSAGE_MAX_LENGTH}
                        onChange={this.onMessageChanged}
                    />
                    {serverError}
                </div>
                {/* eslint-disable-next-line react/jsx-no-literals */}
                <div className='text-muted text-right'>
                    {localizeMessage('user.settings.notifications.maxSize', 'Max. character limit is ')}{MESSAGE_MAX_LENGTH}
                </div>
            </div>
        );

        const dayPickerStyle = {
            height: 30,
            width: 150,
            borderRadius: 4,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgb(204, 204, 204)',
        };

        const step = 30;
        var options = [];
        var start = '12:00AM';
        var end = '12:00AM';
        var now = moment().format('LT');
        var diff = moment(start, 'h:mmA').diff(moment(end, 'h:mmA'));
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (moment(start, 'h:mmA').diff(moment(now, 'h:mmA')) >= 0) {
                options.push({value: start, label: start});
            }
            start = moment(start, 'h:mmA').add(step, 'minutes').format('h:mmA');
            diff = moment(start, 'h:mmA').diff(moment(end, 'h:mmA'));
            if (diff === 0) {
                break;
            }
        }
        const {from, to} = this.state;
        const modifiers = {start: from, end: to};
        const fromTimePicker = (
            <span>
                <TimePicker
                    ref={(el) => {
                        this.fromTime = el;
                    }}
                    options={options}
                    key={'fromTime'}
                    submit={this.props.setParentState}
                />
            </span>
        );

        const toTimePicker = (
            <span>
                <TimePicker
                    ref={(el) => {
                        this.fromTime = el;
                    }}
                    options={options}
                    key={'fromTime'}
                    submit={this.props.setParentState}
                />
            </span>
        );

        // {' '}{' '}—{' '}
        // const datePicker = (
        //     <div style={{display: 'inline-block', textAlign: 'left'}}>
        //         <div
        //             style={{display: 'inline-flex'}}
        //         >
        //             <DayPickerInput
        //                 ref={(el) => {
        //                     this.from = el;
        //                 }}
        //                 inputProps={{style: dayPickerStyle}}
        //                 value={from}
        //                 placeholder='Start(Optional)'
        //                 format='LL'
        //
        //                 // formatDate={formatDate}
        //                 // parseDate={parseDate}
        //                 dayPickerProps={{
        //                     selectedDays: [from, {from, to}],
        //                     disabledDays: {after: to},
        //                     toMonth: to,
        //                     modifiers,
        //                     numberOfMonths: 1,
        //
        //                     // onDayClick: () => this.to.getInput().focus(),
        //                 }}
        //                 onDayChange={this.handleFromChange}
        //             />
        //             {this.state.isFromChanged && <div>{fromTimePicker}</div>}
        //         </div>
        //         <div
        //             style={{display: 'inline-flex', padding: '10px'}}
        //         >
        //             <DayPickerInput
        //                 ref={(el) => {
        //                     this.to = el;
        //                 }}
        //                 inputProps={{style: dayPickerStyle}}
        //                 value={to}
        //                 placeholder='End(Optional)'
        //                 format='LL'
        //
        //                 // formatDate={formatDate}
        //                 // parseDate={parseDate}
        //                 dayPickerProps={{
        //                     selectedDays: [from, {from, to}],
        //                     disabledDays: {before: from},
        //                     modifiers,
        //                     month: from,
        //                     fromMonth: from,
        //                     numberOfMonths: 1,
        //                     onDayClick: () => this.setState({isFromChanged: true}),
        //                 }}
        //                 onDayChange={this.handleToChange}
        //             />
        //             {this.state.isToChanged && <div>{toTimePicker}</div>}
        //         </div>
        //     </div>
        // );

        const fromDatePicker = (
            <div
                style={{display: 'block'}}
            >
                <label style={{paddingRight: 10}}>Start Time:</label>
                <DayPickerInput
                    ref={(el) => {
                        this.from = el;
                    }}
                    inputProps={{style: dayPickerStyle}}
                    value={from}
                    placeholder='Start(Optional)'
                    format='LL'

                    // formatDate={formatDate}
                    // parseDate={parseDate}
                    dayPickerProps={{
                        selectedDays: [from, {from, to}],
                        disabledDays: {after: to},
                        toMonth: to,
                        modifiers,
                        numberOfMonths: 1,

                        // onDayClick: () => this.to.getInput().focus(),
                    }}
                    onDayChange={this.handleFromChange}
                />
                {this.state.isFromChanged && <div>{fromTimePicker}</div>}
            </div>
        );

        const toDatePicker = (
            <div
                style={{display: 'inline-flex', paddingTop: '10px'}}
            >
                <label style={{paddingRight: 30}}>End Time</label>
                <DayPickerInput
                    ref={(el) => {
                        this.to = el;
                    }}
                    inputProps={{style: dayPickerStyle}}
                    value={to}
                    placeholder='End(Optional)'
                    format='LL'

                    // formatDate={formatDate}
                    // parseDate={parseDate}
                    dayPickerProps={{
                        selectedDays: [from, {from, to}],
                        disabledDays: {before: from},
                        modifiers,
                        month: from,
                        fromMonth: from,
                        numberOfMonths: 1,
                        onDayClick: () => this.setState({isFromChanged: true}),
                    }}
                    onDayChange={this.handleToChange}
                />
                {this.state.isToChanged && <div>{toTimePicker}</div>}
            </div>
        );
        inputs.push(activeToggle);
        if (autoResponderActive) {
            inputs.push(fromDatePicker);
            inputs.push(toDatePicker);
            inputs.push(message);
        }
        inputs.push((
            <div key='autoResponderHint'>
                <br/>
                <FormattedHTMLMessage
                    id='user.settings.notifications.autoResponderHint'
                    defaultMessage='Set a custom message that will be automatically sent in response to Direct Messages. Mentions in Public and Private Channels will not trigger the automated reply. Enabling Automatic Replies sets your status to Out of Office and disables email and push notifications.'
                />
            </div>
        ));
        return (
            <div className=''>
                <SettingItemMax
                    width='full'
                    shiftEnter={true}
                    submit={this.props.submit}
                    saving={this.props.saving}
                    inputs={inputs}
                    updateSection={this.props.updateSection}
                />
            </div>
        );
    }
}
