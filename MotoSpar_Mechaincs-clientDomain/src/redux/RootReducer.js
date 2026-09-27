import { createReducer } from '@reduxjs/toolkit'

const initialState = {
  loggedIn: false,
  userData: {},
  notificationCount: null,
  token: null,
  refreshToken: null,
};

export const RootReducer = createReducer(initialState, (builder) => {

  builder.addCase('SET_TOKEN', (state, action) => {
    state.token = action.payload;
  })
  builder.addCase('DEVICE_TOKEN', (state, action) => {
    state.device_token = action.payload;
  })
  builder.addCase('SET_REFRESHTOKEN', (state, action) => {
    state.refreshToken = action.payload;
  })
  builder.addCase('SET_LOGGEDIN', (state, action) => {
    state.loggedIn = action.payload;
  })
  builder.addCase('SET_USER_DATA', (state, action) => {
    state.userData = action.payload;
  });
  builder.addCase('SET_NOTIFCATION_COUNT', (state, action) => {
    state.notificationCount = action.payload;
  });
  builder.addCase('REMOVE_USER_DATA', (state, action) => {
    state.userData = new Object();
  })

});
// export default RootReducer;