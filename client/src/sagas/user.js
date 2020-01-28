import { all, put, takeLatest } from 'redux-saga/effects';

import * as actions from '../actions/type';
import { success, error } from '../actions/app';
import Api, { ApiError } from '../helpers/api';
import LocalStore from '../helpers/storage/local';


function* login(action) {
  try {
    const response = yield Api.login(action.payload.username, action.payload.password);
    if (response.error) {
      throw new ApiError(response.error);
    }
    const previousId = LocalStore.read(LocalStore.keys.lastId);
    const currentId = window.btoa(response.payload.data.data.user.username);
    LocalStore.write(LocalStore.keys.lastId, currentId);
    yield put({ type: actions.USER_LOGIN_SUCCEEDED, payload: response.payload });
    if (currentId === previousId) {
      yield put({ type: actions.USER_SESSION_RESTORE_LAST_KNOWN_STATE });
    } else {
      yield put({ type: actions.NAVIGATION_PATIENT_SEARCH_SCREEN_REQUESTED });
    }
  } catch (e) {
    yield put({ type: actions.USER_LOGIN_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function* logout() {
  try {
    LocalStore.remove(LocalStore.keys.lastId);
    LocalStore.remove(LocalStore.keys.lastScreen);
    LocalStore.remove(LocalStore.keys.lastScreenState);
    const response = yield Api.logout();
    if (response.error) {
      throw new ApiError(response.error);
    }
    yield put({ type: actions.USER_LOGOUT_SUCCEEDED });
  } catch (e) {
    yield put({ type: actions.USER_LOGOUT_FAILED, payload: e });
  }
}

function* recover(action) {
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_RECOVERY_SUCCEEDED, payload: action.payload });
    yield put(success(window.CLIN.translate({ id: 'message.success.generic' })));
  } catch (e) {
    yield put({ type: actions.USER_RECOVERY_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function* fetch(action) {
  try {
    yield new Promise(resolve => setTimeout(() => resolve(1), 1500));
    yield put({ type: actions.USER_FETCH_SUCCEEDED, payload: action.payload });
    yield put(success(window.CLIN.translate({ id: 'message.success.generic' })));
  } catch (e) {
    yield put({ type: actions.USER_FETCH_FAILED, payload: e });
    yield put(error(window.CLIN.translate({ id: 'message.error.generic' })));
  }
}

function* watchUserLogin() {
  yield takeLatest(actions.USER_LOGIN_REQUESTED, login);
}

function* watchUserLogout() {
  yield takeLatest(actions.USER_LOGOUT_REQUESTED, logout);
}

function* watchUserRecover() {
  yield takeLatest(actions.USER_RECOVERY_REQUESTED, recover);
}

function* watchUserFetch() {
  yield takeLatest(actions.USER_FETCH_REQUESTED, fetch);
}

export default function* watchedUserSagas() {
  yield all([
    watchUserLogin(),
    watchUserRecover(),
    watchUserFetch(),
    watchUserLogout(),
  ]);
}
