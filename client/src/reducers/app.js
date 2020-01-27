/* eslint-disable camelcase, no-param-reassign */
import PropTypes from 'prop-types';
import { produce } from 'immer';
import { message } from 'antd';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-ca';
import * as frFr from 'antd/lib/locale-provider/fr_FR';
import * as enUS from 'antd/lib/locale-provider/en_US';
import * as actions from '../actions/type';


export const initialAppState = {
  showLoadingAnimation: false,
  showSubloadingAnimation: false,
  locale: {
    lang: null,
    antd: null,
  },
};

// @TODO
export const appShape = {
  showLoadingAnimation: PropTypes.bool.isRequired,
  showSubloadingAnimation: PropTypes.bool.isRequired,
  locale: PropTypes.shape({
    lang: PropTypes.string,
    antd: PropTypes.shape({}),
  }).isRequired,
};

const appReducer = (state = Object.assign({}, initialAppState), action) => produce(state, (draft) => {
  switch (action.type) {
    case actions.SHOW_NOTIFICATION:
      if (!window.agent) {
        message[action.payload.type](action.payload.message);
      } else {
        switch (action.payload.type) {
          default:
          case 'success':
            window.agent.play('Wave');
            break;
          case 'error':
            window.agent.play('Hearing_1');
            break;
          case 'warn':
          case 'warning':
            window.agent.play('GetAttention');
            break;
        }
      }
      break;

    case actions.START_LOADING_ANIMATION:
    case actions.APP_FETCH_REQUESTED:
    case actions.USER_LOGIN_REQUESTED:
    case actions.USER_LOGOUT_REQUESTED:
    case actions.USER_RECOVERY_REQUESTED:
    case actions.ROUTER_NAVIGATION_REQUESTED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED:
    case actions.NAVIGATION_PATIENT_SCREEN_REQUESTED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_REQUESTED:
      draft.showLoadingAnimation = true;
      break;

    case actions.STOP_LOADING_ANIMATION:
    case actions.APP_FETCH_SUCCEEDED:
    case actions.APP_FETCH_FAILED:
    case actions.APP_CHANGE_LANGUAGE_SUCCEEDED:
    case actions.APP_CHANGE_LANGUAGE_FAILED:
    case actions.ROUTER_NAVIGATION_SUCCEEDED:
    case actions.ROUTER_NAVIGATION_FAILED:
    case actions.USER_LOGIN_SUCCEEDED:
    case actions.USER_LOGIN_FAILED:
    case actions.USER_LOGOUT_SUCCEEDED:
    case actions.USER_LOGOUT_FAILED:
    case actions.USER_RECOVERY_SUCCEEDED:
    case actions.USER_RECOVERY_FAILED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_SEARCH_SCREEN_FAILED:
    case actions.NAVIGATION_PATIENT_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_SCREEN_FAILED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_SUCCEEDED:
    case actions.NAVIGATION_PATIENT_VARIANT_SCREEN_FAILED:
      draft.showLoadingAnimation = false;
      if (window.agent) {
        const agentIdle = ['IdleScratch', 'IdleStretch', 'IdleTailWagA', 'IdleTailWagB', 'IdleTailWagC', 'IdleTailWagD', 'IdleTwitch', 'IdleYawn', 'IdleButterFly', 'IdleCleaning', 'IdleLegLick', 'GetArtsy'];
        window.agent.play(agentIdle[Math.floor((Math.random() * agentIdle.length))]);
      }
      break;

    case actions.START_SUBLOADING_ANIMATION:
    case actions.USER_FETCH_REQUESTED:
    case actions.PATIENT_SEARCH_REQUESTED:
    case actions.PATIENT_FETCH_REQUESTED:
    case actions.PATIENT_VARIANT_SEARCH_REQUESTED:
    case actions.PATIENT_VARIANT_COUNT_REQUESTED:
    case actions.VARIANT_SCHEMA_REQUESTED:
      draft.showSubloadingAnimation = true;
      break;

    case actions.STOP_SUBLOADING_ANIMATION:
    case actions.USER_FETCH_SUCCEEDED:
    case actions.USER_FETCH_FAILED:
    case actions.PATIENT_SEARCH_SUCCEEDED:
    case actions.PATIENT_SEARCH_FAILED:
    case actions.PATIENT_FETCH_SUCCEEDED:
    case actions.PATIENT_FETCH_FAILED:
    case actions.PATIENT_VARIANT_SEARCH_SUCCEEDED:
    case actions.PATIENT_VARIANT_SEARCH_FAILED:
    case actions.PATIENT_VARIANT_COUNT_SUCCEEDED:
    case actions.PATIENT_VARIANT_COUNT_FAILED:
    case actions.VARIANT_SCHEMA_SUCCEEDED:
    case actions.VARIANT_SCHEMA_FAILED:
      draft.showSubloadingAnimation = false;
      break;

    case actions.APP_CHANGE_LANGUAGE_REQUESTED:
      draft.showLoadingAnimation = true;
      if (action.payload.language === 'fr') {
        draft.locale.lang = action.payload.language;
        draft.locale.antd = frFr;
        moment.locale(action.payload.language);
      } else if (action.payload.language === 'en') {
        draft.locale.lang = action.payload.language;
        draft.locale.antd = enUS;
        moment.locale(`${action.payload.language}-ca`);
      }
      break;

    default:
      break;
  }
});

export default appReducer;
