import React, { useState, useEffect } from "react";
import "./styles.css";
import { useHistory, Link } from "react-router-dom";
import bgSignin from "../../Assets/images/bgsignin.jpg";
import * as Yup from "yup";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../Actions/AuthAction";
import axios from "../../Services/axios";

function Signin(props) {
  const initialValues = {
    email: "",
    password: "",
  };
  const [user, setUser] = useState(props.user || {});
  const [valid, setValid] = useState(false);
  const [inValid, setInValid] = useState("");
  const { error } = useSelector((state) => state.login);
  console.log(error);
  // console.log(userLogin)
  const history = useHistory();
  const dispatch = useDispatch();
  const userInfo = JSON.parse(localStorage.getItem("user"));
  const validationSchema = () => {
    return Yup.object().shape({
      email: Yup.string()
        .required("Email is required")
        .email("Email is invalid"),
      password: Yup.string()
        .required("Password is required")
        .min(6, "Password must be at least 6 characters")
        .max(40, "Password must not exceed 40 characters"),
    });
  };
  const handleChange = (event) => {
    const { name, value } = event.target;

    setUser((user) => ({
      ...user,
      [name]: value,
    }));
  };

  const handleUpdateStatus = async (user) => {
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
        console.log(response);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userInfo) {
      handleUpdateStatus(userInfo);
    }
  }, [userInfo]);

  const handleSubmit = (value) => {
    const data = {
      email: value.email,
      password: value.password,
    };
    dispatch(loginUser(data));
  };

  if (userInfo) {
    history.push("/");
  }
  return (
    <div className="SignIn mt-5">
      <div className="signin-label">
        <div className="label_img">
          <img className="label_img" src={bgSignin} alt="Travelgo" />
        </div>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched }) => (
          <Form>
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
              Sign in
            </h3>
            <div className="form-holder singup-active">
              <Field
                name="email"
                type="text"
                className={
                  "signup-form-control" +
                  (errors.email && touched.email ? " is-invalid" : "")
                }
                placeholder="Input email"
                onKeyUp={handleChange}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="invalid-feedback"
              />
            </div>

            <div className="form-holder">
              <Field
                name="password"
                type="password"
                className={
                  "signup-form-control" +
                  (errors.password && touched.password ? " is-invalid" : "")
                }
                placeholder="Input password"
                onKeyUp={handleChange}
              />
              <ErrorMessage
                name="password"
                component="div"
                className="invalid-feedback"
              />
            </div>
            {error ? (
              <p style={{ color: "#DC0000" }}>{error.response.data}</p>
            ) : (
              <></>
            )}
            <div className="form-login">
              <button className="signup-submit" type="submit">
                Sign in
              </button>
            </div>
            <a
              href="/forgot-password"
              style={{ textDecoration: "none", marginTop: "20px" }}
            >
              Forget Password ?
            </a>
            <div>
              <p>
                Don't have account ?{" "}
                <span>
                  <Link to="/sign-up" style={{ textDecoration: "none" }}>
                    Sign up
                  </Link>
                </span>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Signin;
