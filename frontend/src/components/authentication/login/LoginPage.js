import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import TextField from "@mui/material/TextField";
import { Button, OutlinedInput } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";

import axios from "axios";

import AuthForm from "../AuthForm";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

import { useNotification } from "../../../contexts/NotificationContext";

const API_LOGIN = "/account/login/";

function Login() {
  const { newNotification } = useNotification();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  // AuthContext
  const { auth, setAuth } = useAuth();

  // Toggle the visibility of password
  const [showPassword, setShowPassword] = useState(false);

  // Form submission
  const onSuccess = async (data) => {
    console.log(data);
    try {
      let response = await axios.post(API_LOGIN, data);
      console.log("response:", response);
      setAuth(true);
    } catch (e) {
      console.log(e.response.data);
      let data = e.response.data;
      if (data["error"]) {
        newNotification(data["error"], "error", 5000);
      }

      Object.keys(data).forEach((key) => {
        setError(key, {
          type: "server",
          message: data[key].reduce(
            (allMessage, currMessage) => allMessage + " " + currMessage,
            ""
          ),
        });
      });
    }
  };

  return (
    <>
      {auth && <Navigate to="/home" />}
      <AuthForm handleSubmit={handleSubmit(onSuccess)}>
        <h1>Login</h1>
        {/* Email field */}
        <TextField
          {...register("email", {
            required: { value: true, message: "This is required." },
          })}
          label="Email"
          size="medium"
          error={errors["email"] != undefined}
          helperText={errors["email"] ? errors["email"].message : ""}
          className="max-w-lg"
        />

        <FormControl
          variant="outlined"
          error={errors["password"] != undefined}
          size="medium"
        >
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            {...register("password", {
              required: { value: true, message: "This is required." },
            })}
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
          {errors["password"] != undefined ? (
            <FormHelperText>{errors["password"].message}</FormHelperText>
          ) : null}
        </FormControl>

        <div className="flex justify-between">
          <Button variant="text" sx={{ textTransform: "none" }}>
            Forgot Password?
          </Button>

          <Button
            to="/account/register"
            variant="text"
            sx={{ textTransform: "none" }}
            component={Link}
          >
            Register now!
          </Button>
        </div>
        <Button type="submit" variant="contained">
          Login
        </Button>
      </AuthForm>
    </>
  );
}

export default Login;
