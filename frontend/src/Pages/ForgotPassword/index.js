import React, { useState, useEffect } from 'react';
import "./styles.css";
import { useHistory, Link } from 'react-router-dom'
import bgSignin from '../../Assets/images/bgsignin.jpg';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage, FastField } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { forgetPassword } from '../../Actions/AuthAction';

function ForgotPassword(props) {
  const initialValues = {
    email: '',
  };

  const [forgotState, setForgotState] = useState({
    initial: false,
    userCheck: true,
    confirm: false,
  });

  const [email, setEmail] = useState('');
  const history = useHistory();
  const forgot = useSelector((state) => state.forgot);
  const dispatch = useDispatch();

  const userInfo = JSON.parse(localStorage.getItem("user"));
  if (userInfo) {
    history.push("/");
  };

  const validationSchema = () => {
    return Yup.object().shape({
      email: Yup.string()
        .required('Email is required')
        .email('Email is invalid'),
    });
  };

  const handleSubmit = (value) => {
    setEmail(value.email);
    dispatch(forgetPassword(value));
  };

  useEffect(() => {
    if (!forgotState.initial) {
      setForgotState({ ...forgotState, initial: true });
    }
    
  }, [email]);

  useEffect(() => {
    if (forgotState.initial) {
      if (!forgot.isLoading && forgot.message !== '' && !forgot.error) {
        setForgotState({
          ...forgotState,
          initial: false,
          userCheck: true,
          confirm: true,
        });
      }
      else {
        if(forgot.error){
          setForgotState({
            ...forgotState,
            initial: false,
            userCheck: false,
            confirm: false,
          })
        }
      }
    }

  }, [forgot]);


  return (
    <div className="ForgotPass my-5 py-3">

      <div className="position-relative">
        <div style={{
          width: '400px',
        }} className="flex justify-center">
          <img style={{
            width: "300px",
            height: "280px"
          }} src={bgSignin} alt="Booking4T" />
        </div>
      </div>

      {forgotState.confirm ?
        <div className='text-center w-100 text-[#A20300]'>
          <p>
            Confirmation link has been sent to mail: <b>{email} </b> <br />
            Open your email to activate the latest link and continue to log in then.
          </p>
        </div>
        :
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (

            <Form>
              <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Forgot Password</h3>
              <div className="form-holder forgot-pass-form">
                {!forgotState.initial && <div className={forgotState.userCheck ? 'd-none' : 'd-block text-danger mb-2'}>Email: <b>{email}</b> is yet to be registered!</div>}
                <Field
                  name="email"
                  type="text"
                  className={
                    'forgot-form-control' +
                    (errors.email && touched.email ? ' is-invalid' : '')
                  }
                  placeholder="Input email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="form-button">
                <button
                  className='forgot-pass-btn'
                  type="submit">
                  Confirm
                </button>
              </div>
            </Form>
          )}
        </Formik>
      }

    </div>
  )
}

export default ForgotPassword