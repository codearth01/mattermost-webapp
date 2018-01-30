// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See License.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedHTMLMessage, FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import * as UserActions from 'actions/user_actions.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import {getTimezoneRegion, getBrowserTimezone} from 'utils/timezone';

import SuggestionBox from 'components/suggestion/suggestion_box.jsx';
import SuggestionList from 'components/suggestion/suggestion_list.jsx';
import TimezoneProvider from 'components/suggestion/timezone_provider.jsx';

const KeyCodes = Constants.KeyCodes;

export default class ManageTimezones extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            useAutomaticTimezone: props.useAutomaticTimezone,
            automaticTimezone: props.automaticTimezone,
            manualTimezone: props.manualTimezone,
            manualTimezoneInput: props.manualTimezone,
            isSaving: false
        };
    }

    onChange = (e) => {
        this.setState({manualTimezoneInput: e.target.value});
    };

    handleTimezoneSelected = (selected) => {
        if (!selected) {
            return;
        }

        this.setState({
            manualTimezone: selected,
            manualTimezoneInput: selected
        });
    };

    timezoneNotChanged = () => {
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone
        } = this.state;

        const {
            useAutomaticTimezone: oldUseAutomaticTimezone,
            automaticTimezone: oldAutomaticTimezone,
            manualTimezone: oldManualTimezone
        } = this.props;

        return (
            useAutomaticTimezone === oldUseAutomaticTimezone &&
            automaticTimezone === oldAutomaticTimezone &&
            manualTimezone === oldManualTimezone
        );
    };

    submitTimezoneChange = () => {
        const {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone
        } = this.state;

        if (this.timezoneNotChanged()) {
            this.props.updateSection('');
            return;
        }

        const timezone = {
            useAutomaticTimezone,
            automaticTimezone,
            manualTimezone
        };

        UserActions.saveTimezone(
            timezone,
            () => this.props.updateSection('')
        );
    };

    handleAutomaticTimezone = (e) => {
        const useAutomaticTimezone = e.target.checked;
        let automaticTimezone = null;

        if (useAutomaticTimezone) {
            automaticTimezone = getBrowserTimezone();
        }

        this.setState({
            useAutomaticTimezone,
            automaticTimezone
        });
    };

    handleManualTimezone = (e) => {
        this.setState({manualTimezone: e.target.value});
    };

    render() {
        const {
            useAutomaticTimezone,
            automaticTimezone
        } = this.state;

        let serverError;
        if (this.state.serverError) {
            serverError = <label className='has-error'>{this.state.serverError}</label>;
        }

        const inputs = [];

        const timezoneRegion = (
            <li
                className='section-describe'
            >
                {useAutomaticTimezone && getTimezoneRegion(automaticTimezone)}
            </li>
        );

        const automaticTimezoneInput = (
            <div className='checkbox'>
                <label>
                    <input
                        id='automaticTimezoneInput'
                        type='checkbox'
                        checked={useAutomaticTimezone}
                        onChange={this.handleAutomaticTimezone}
                    />
                    <FormattedMessage
                        id='user.settings.timezones.automatic'
                        defaultMessage='Set automatically'
                    />
                    {timezoneRegion}
                </label>
            </div>
        );

        const providers = [new TimezoneProvider()];
        const manualTimezoneInput = (
            <div key='changeTimezone'>
                <br/>
                <label className='control-label'>
                    <FormattedMessage
                        id='user.settings.timezones.change'
                        defaultMessage='Change timezone'
                    />
                </label>
                <div className='padding-top'>
                    <SuggestionBox
                        ref={this.setSwitchBoxRef}
                        className='form-control focused'
                        type='search'
                        onChange={this.onChange}
                        value={this.state.manualTimezoneInput}
                        onItemSelected={this.handleTimezoneSelected}
                        listComponent={SuggestionList}
                        maxLength='64'
                        requiredCharacters={0}
                        providers={providers}
                        listStyle='bottom'
                        completeOnTab={false}
                        renderDividers={false}
                    />
                    {serverError}
                </div>
                <div>
                    <br/>
                    <FormattedHTMLMessage
                        id='user.settings.timezones.promote'
                        defaultMessage='Select the time zone used for timestamps in the user interface and email notifications.'
                    />
                </div>
            </div>
        );

        inputs.push(automaticTimezoneInput);

        if (!useAutomaticTimezone) {
            inputs.push(manualTimezoneInput);
        }

        return (
            <SettingItemMax
                title={
                    <FormattedMessage
                        id='user.settings.display.timezone'
                        defaultMessage='Timezone'
                    />
                }
                containerStyle={{
                    overflow: 'visible',
                    display: 'table',
                    width: '100%'
                }}
                width='medium'
                submit={this.submitTimezoneChange}
                saving={this.state.isSaving}
                inputs={inputs}
                updateSection={this.props.updateSection}
            />
        );
    }
}

ManageTimezones.propTypes = {
    user: PropTypes.object.isRequired,
    updateSection: PropTypes.func.isRequired,
    useAutomaticTimezone: PropTypes.bool.isRequired,
    automaticTimezone: PropTypes.string.isRequired,
    manualTimezone: PropTypes.string.isRequired
};
