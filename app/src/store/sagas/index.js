import {put, call, all, takeEvery,takeLatest,fork} from 'redux-saga/effects';



const watchAuthDetails = function* watchAuthDetails() {
    yield takeLatest("AUTH_DETAILS",  function*(action) {
        yield put({ type: "SET_AUTH_DETAILS", payload: action.payload });
    });


};

export default function* rootSaga() {
    yield all([
        fork(watchAuthDetails)
    ]);
}