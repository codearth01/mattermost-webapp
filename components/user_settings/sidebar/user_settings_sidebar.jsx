// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {trackEvent} from 'actions/diagnostics_actions.jsx';

import Constants from 'utils/constants.jsx';
import {localizeMessage} from 'utils/utils.jsx';

import SettingItemMax from 'components/setting_item_max.jsx';
import SettingItemMin from 'components/setting_item_min.jsx';

export default class UserSettingsSidebar extends React.Component {
    static propTypes = {
        actions: PropTypes.shape({

            /*
             * Function to save the user's preferences
             */
            savePreferences: PropTypes.func.isRequired,
        }).isRequired,

        /**
         * Current user object
         */
        user: PropTypes.object,

        /**
         * The preferences for closing the unused direct messages channels
         */
        closeUnusedDirectMessages: PropTypes.string.isRequired,

        /**
         * Display the close unused direct messages channels options
         */
        showUnusedOption: PropTypes.bool.isRequired,

        /**
         * Display the channel grouping and sorting sections options
         */
        showChannelOrganization: PropTypes.bool.isRequired,

        /**
         * The preferences to display channels in sidebar
         */
        sidebarPreference: PropTypes.shape({

            /**
             * Group channels by type or none
             */
            grouping: PropTypes.string.isRequired,

            /**
             * Sort channels by recency or alphabetical order
             */
            sorting: PropTypes.string.isRequired,

            /**
             * Option for including unread channels at top
             */
            unreadsAtTop: PropTypes.string.isRequired,

            /**
             * Option for including favorite channels at top
             */
            favoriteAtTop: PropTypes.string.isRequired,
        }).isRequired,

        updateSection: PropTypes.func,
        activeSection: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        collapseModal: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = this.getStateFromStores();
    }

    getStateFromStores = () => {
        const {
            closeUnusedDirectMessages,
            sidebarPreference: {
                grouping,
                sorting,
                unreadsAtTop,
                favoriteAtTop,
            },
        } = this.props;

        return {
            settings: {
                close_unused_direct_messages: closeUnusedDirectMessages,
                grouping,
                unreadsAtTop,
                favoriteAtTop,
                sorting,
            },
            isSaving: false,
        };
    };

    trackSettingChangeIfNecessary = (setting) => {
        if (this.state.settings[setting] !== this.props.sidebarPreference[setting]) {
            trackEvent('settings', 'user_settings_update', {field: 'sidebar.' + setting, value: this.state.settings[setting]});
        }
    }

    updateSetting = (setting, value) => {
        const settings = this.state.settings;
        settings[setting] = value;

        this.setState(settings);
    };

    handleSubmit = (setting) => {
        const {actions, user} = this.props;
        const preferences = [];

        if (setting === 'channel_grouping' || setting === 'channel_sorting') {
            const updatedSidebarSettings = {
                grouping: this.state.settings.grouping,
                unreads_at_top: this.state.settings.unreadsAtTop,
                favorite_at_top: this.state.settings.favoriteAtTop,
                sorting: this.state.settings.sorting,
            };

            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: '',
                value: JSON.stringify(updatedSidebarSettings),
            });

            this.trackSettingChangeIfNecessary('grouping');
            this.trackSettingChangeIfNecessary('sorting');
            this.trackSettingChangeIfNecessary('unreadsAtTop');
            this.trackSettingChangeIfNecessary('favoriteAtTop');
        } else {
            preferences.push({
                user_id: user.id,
                category: Constants.Preferences.CATEGORY_SIDEBAR_SETTINGS,
                name: setting,
                value: this.state.settings[setting],
            });

            trackEvent('settings', 'user_settings_update', {field: 'sidebar.' + setting, value: this.state.settings[setting]});
        }

        this.setState({isSaving: true});

        actions.savePreferences(user.id, preferences).then(() => {
            this.updateSection('');
        });
    };

    updateSection = (section) => {
        if (!section) {
            this.setState(this.getStateFromStores());
        }
        this.setState({isSaving: false});
        this.props.updateSection(section);
    };

    renderAutoCloseDMLabel = (value) => {
        if (value === 'after_seven_days') {
            return (
                <FormattedMessage
                    id='user.settings.sidebar.after_seven_days'
                    defaultMessage='After 7 days with no new messages'
                />
            );
        }

        return (
            <FormattedMessage
                id='user.settings.sidebar.never'
                defaultMessage='Never'
            />
        );
    };

    renderAutoCloseDMSection = () => {
        let contents;

        if (this.props.activeSection === 'autoCloseDM') {
            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.autoCloseDMTitle'
                            defaultMessage='Automatically Close Direct Messages'
                        />
                    }
                    inputs={[
                        <div key='autoCloseDMSetting'>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMAfterSevenDays'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'after_seven_days'}
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'after_seven_days')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.after_seven_days'
                                        defaultMessage='After 7 days with no new messages'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div className='radio'>
                                <label>
                                    <input
                                        id='autoCloseDMNever'
                                        type='radio'
                                        name='autoCloseDM'
                                        checked={this.state.settings.close_unused_direct_messages === 'never'}
                                        onChange={this.updateSetting.bind(this, 'close_unused_direct_messages', 'never')}
                                    />
                                    <FormattedMessage
                                        id='user.settings.sidebar.never'
                                        defaultMessage='Never'
                                    />
                                </label>
                                <br/>
                            </div>
                            <div>
                                <br/>
                                <FormattedMessage
                                    id='user.settings.sidebar.autoCloseDMDesc'
                                    defaultMessage='Direct Message conversations can be reopened with the “+” button in the sidebar or using the Channel Switcher (CTRL+K).'
                                />
                            </div>
                        </div>,
                    ]}
                    setting={'close_unused_direct_messages'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        } else {
            contents = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.autoCloseDMTitle'
                            defaultMessage='Automatically Close Direct Messages'
                        />
                    }
                    describe={this.renderAutoCloseDMLabel(this.state.settings.close_unused_direct_messages)}
                    section={'autoCloseDM'}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <React.Fragment>
                {contents}
                <div className='divider-dark'/>
            </React.Fragment>
        );
    };

    renderOrganizationLabel = () => {
        const {
            grouping,
            unreadsAtTop,
            favoriteAtTop,
            sorting,
        } = this.props.sidebarPreference;

        const messages = [];

        if (grouping === 'by_type') {
            messages.push(
                <FormattedMessage
                    key='by_type'
                    id='user.settings.sidebar.groupByTypeShort'
                    defaultMessage='Group by channel type'
                />
            );
        } else {
            messages.push(
                <FormattedMessage
                    key='none'
                    id='user.settings.sidebar.groupByNoneShort'
                    defaultMessage='No grouping'
                />
            );
        }

        let sortingId;
        let sortingDefaultMessage;
        if (sorting === 'alpha') {
            sortingId = 'user.settings.sidebar.sortAlphaShort';
            sortingDefaultMessage = 'sorted alphabetically';
        } else {
            sortingId = 'user.settings.sidebar.sortRecentShort';
            sortingDefaultMessage = 'sorted by recency';
        }

        messages.push(
            <span key='comma'>{', '}</span>
        );

        messages.push(
            <FormattedMessage
                key='sorting'
                id={sortingId}
                defaultMessage={sortingDefaultMessage}
            />
        );

        let atTopId = null;
        let atTopDefaultMessage = null;
        if (unreadsAtTop === 'true' && favoriteAtTop === 'false') {
            atTopId = 'user.settings.sidebar.unreadsShort';
            atTopDefaultMessage = 'Unreads grouped separately';
        } else if (unreadsAtTop === 'false' && favoriteAtTop === 'true') {
            atTopId = 'user.settings.sidebar.favoritesShort';
            atTopDefaultMessage = 'Favorites grouped separately';
        } else if (unreadsAtTop === 'true' && favoriteAtTop === 'true') {
            atTopId = 'user.settings.sidebar.unreadsFavoritesShort';
            atTopDefaultMessage = 'Unreads and favorites grouped separately';
        }

        if (atTopId) {
            messages.push(
                <br/>
            );

            messages.push(
                <FormattedMessage
                    key='atTop'
                    id={atTopId}
                    defaultMessage={atTopDefaultMessage}
                />
            );
        }

        return messages;
    };

    renderChannelOrganizationSection = () => {
        const {
            grouping,
            sorting,
        } = this.state.settings;

        let contents;

        if (this.props.activeSection === 'groupChannels') {
            const inputs = [];

            inputs.push(
                <div key='groupingSectionSetting'>
                    <label>
                        <FormattedMessage
                            id='user.settings.sidebar.groupChannelsTitle'
                            defaultMessage='Channel grouping'
                        />
                    </label>
                    <br/>
                    <div className='radio'>
                        <label>
                            <input
                                id='byTypeOption'
                                type='radio'
                                name='groupChannels'
                                checked={grouping === 'by_type'}
                                onChange={this.updateSetting.bind(this, 'grouping', 'by_type')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.groupByType'
                                defaultMessage='Channels grouped by type'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='noneOption'
                                type='radio'
                                name='groupChannels'
                                checked={grouping === 'none'}
                                onChange={this.updateSetting.bind(this, 'grouping', 'none')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.groupByNone'
                                defaultMessage='Combine all channel types'
                            />
                        </label>
                        <br/>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.groupDesc'
                            defaultMessage='Group channels by type, or combine all types into a list.'
                        />
                    </div>
                </div>
            );

            inputs.push(<hr key='sortingDivider'/>);

            inputs.push(
                <div key='sortingOptions'>
                    <label>
                        <FormattedMessage
                            id='user.settings.sidebar.sortChannelsTitle'
                            defaultMessage='Channel sorting'
                        />
                    </label>
                    <br/>
                    <div className='radio'>
                        <label>
                            <input
                                id='recentSectionEnabled'
                                type='radio'
                                name='sortChannels'
                                checked={sorting === 'recent'}
                                onChange={this.updateSetting.bind(this, 'sorting', 'recent')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.sortRecent'
                                defaultMessage='Recency'
                            />
                        </label>
                        <br/>
                    </div>
                    <div className='radio'>
                        <label>
                            <input
                                id='alphaSectionEnabled'
                                type='radio'
                                name='sortChannels'
                                checked={sorting === 'alpha'}
                                onChange={this.updateSetting.bind(this, 'sorting', 'alpha')}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.sortAlpha'
                                defaultMessage='Alphabetically'
                            />
                        </label>
                        <br/>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.sortDesc'
                            defaultMessage='Sort channels alphabetically, or by most recent post.'
                        />
                    </div>
                </div>
            );

            inputs.push(<hr key='divider'/>);

            inputs.push(
                <div key='unreadOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='unreadAtTopOption'
                                type='checkbox'
                                checked={this.state.settings.unreadsAtTop === 'true'}
                                onChange={(e) => this.updateSetting('unreadsAtTop', (e.target.checked).toString())}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.unreads'
                                defaultMessage='Unreads grouped separately'
                            />
                        </label>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.unreadsDesc'
                            defaultMessage='Group unread channels separately until read.'
                        />
                    </div>
                </div>
            );

            inputs.push(<hr key='groupingDivider'/>);

            inputs.push(
                <div key='favoriteOption'>
                    <div className='checkbox'>
                        <label>
                            <input
                                id='favoriteAtTopOption'
                                type='checkbox'
                                checked={this.state.settings.favoriteAtTop === 'true'}
                                onChange={(e) => this.updateSetting('favoriteAtTop', (e.target.checked).toString())}
                            />
                            <FormattedMessage
                                id='user.settings.sidebar.favorites'
                                defaultMessage='Favorites grouped separately'
                            />
                        </label>
                    </div>
                    <div>
                        <br/>
                        <FormattedMessage
                            id='user.settings.sidebar.favoritesDesc'
                            defaultMessage='Channels marked as favorites will be grouped separately.'
                        />
                    </div>
                </div>
            );

            contents = (
                <SettingItemMax
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupAndSortChannelsTitle'
                            defaultMessage='Channel grouping and sorting'
                        />
                    }
                    inputs={inputs}
                    setting={'channel_grouping'}
                    submit={this.handleSubmit}
                    saving={this.state.isSaving}
                    server_error={this.state.serverError}
                    updateSection={this.updateSection}
                />
            );
        } else {
            contents = (
                <SettingItemMin
                    title={
                        <FormattedMessage
                            id='user.settings.sidebar.groupAndSortChannelsTitle'
                            defaultMessage='Channel grouping and sorting'
                        />
                    }
                    describe={this.renderOrganizationLabel()}
                    section={'groupChannels'}
                    updateSection={this.updateSection}
                />
            );
        }

        return (
            <React.Fragment>
                {contents}
                <div className='divider-light'/>
            </React.Fragment>
        );
    };

    render() {
        const {showUnusedOption, showChannelOrganization} = this.props;

        const channelOrganizationSection = showChannelOrganization ? this.renderChannelOrganizationSection() : null;
        const autoCloseDMSection = showUnusedOption ? this.renderAutoCloseDMSection() : null;

        return (
            <div>
                <div className='modal-header'>
                    <button
                        id='closeButton'
                        type='button'
                        className='close'
                        data-dismiss='modal'
                        aria-label='Close'
                        onClick={this.props.closeModal}
                    >
                        <span aria-hidden='true'>{'×'}</span>
                    </button>
                    <h4
                        className='modal-title'
                        ref='title'
                    >
                        <div className='modal-back'>
                            <i
                                className='fa fa-angle-left'
                                title={localizeMessage('generic_icons.collapse', 'Collapse Icon')}
                                onClick={this.props.collapseModal}
                            />
                        </div>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h4>
                </div>
                <div className='user-settings'>
                    <h3 className='tab-header'>
                        <FormattedMessage
                            id='user.settings.sidebar.title'
                            defaultMessage='Sidebar Settings'
                        />
                    </h3>
                    <div className='divider-dark first'/>
                    {channelOrganizationSection}
                    {autoCloseDMSection}
                </div>
            </div>
        );
    }
}
