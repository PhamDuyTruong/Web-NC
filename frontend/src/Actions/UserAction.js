import {
  GET_PROFILE_FAILURE,
  GET_PROFILE_SUCCESS,
  GET_PROFILE_REQUEST,
  PROFILE_UPDATE_FAILURE,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_REQUEST,
  PROFILE_STATUS_SUCCESS,
  PROFILE_STATUS_REQUEST,
  PROFILE_STATUS_FAILURE,
} from "../Constants/UserConstant";
import userApi from "../Services/userApi";
import axios from "../Services/axios";

export const getProfile = () => {
  return async (dispatch) => {
    dispatch({ type: GET_PROFILE_REQUEST });
    try {
      const { data } = await userApi.getProfile();
      dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
    } catch (error) {
      dispatch({ type: GET_PROFILE_FAILURE, payload: error });
    }
  };
};

export const updateUserProfile = (user) => {
  return async (dispatch) => {
    dispatch({ type: PROFILE_UPDATE_REQUEST });
    try {
      const data = {
        username: user.username,
        phone: user.phone,
        email: user.email,
        profilePic: user.profilePic,
        password: user.password,
      };
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const method = "put";
      let url = `/user/me/profile`;
      const headers = {
        "Content-Type": "application/json",
      };
      if (userInfo) {
        const { accessToken } = userInfo;
        headers.token = `Bearer ${accessToken}`;
      }

      await axios({ url, method, data, headers }).then((response) => {
        dispatch({ type: PROFILE_UPDATE_SUCCESS, payload: response.data });
      });
    } catch (error) {
      dispatch({ type: PROFILE_UPDATE_FAILURE, payload: error });
    }
  };
};

export const updateUserStatus = (user) => {
  return async (dispatch) => {
    dispatch({ type: PROFILE_STATUS_REQUEST });
    try {
      const data = {
        username: user.username,
        phone: user.phone,
        email: user.email,
        profilePic: user.profilePic,
        isOnline: true,
      };
      const userInfo = JSON.parse(localStorage.getItem("user"));
      const method = "put";
      let url = `/user/me/status`;
      const headers = {
        "Content-Type": "application/json",
      };
      if (userInfo) {
        const { accessToken } = userInfo;
        headers.token = `Bearer ${accessToken}`;
      }

      await axios({ url, method, data, headers }).then((response) => {
        dispatch({ type: PROFILE_STATUS_SUCCESS, payload: response.data });
      });
    } catch (error) {
      dispatch({ type: PROFILE_STATUS_FAILURE, payload: error });
    }
  };
};
