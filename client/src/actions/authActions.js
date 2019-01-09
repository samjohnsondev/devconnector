// Register  the user
import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

import { GET_ERRORS } from "./types";
import { SET_CURRENT_USER } from "./types";

export const registerUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(result => history.push("/login"))
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

//Login the user and get the token
export const loginUser = userData => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      //Save to loval storage
      console.log(res.data);

      const { token } = res.data;

      localStorage.setItem("jwtToken", token);

      //Set to the auth header
      setAuthToken(token);

      //decode the toke
      const decoded = jwt_decode(token);

      //Set Current user
      dispatch(setCurrentUser(decoded));
    })
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    );
};

export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  };
};

//log the user out
export const logoutUser = () => dispatch => {
//Remov token
  localStorage.removeItem('jwtToken');
  //remove the auth header
  setAuthToken(false);

  //Set the currnt user to an empty bject
  dispatch(setCurrentUser({}))
}