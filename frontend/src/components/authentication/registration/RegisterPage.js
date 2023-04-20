import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
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

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

function Register() {
  let a = {};
  // react-hook-form
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  // Toggle the visibility of password
  const [showPassword, setShowPassword] = useState(false);

  // Form submission
  const onSuccess = async (data) => {
    console.log(data);
    try {
      let response = await axios.post("/account/register/", data);
      console.log(response);
    } catch (e) {
      console.log(e.response.data);
      let data = e.response.data;
      // update errors
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
    <div className="flex justify-center  items-center w-full h-full">
      <form
        className="max-w-[90%] w-[400px]"
        onSubmit={handleSubmit(onSuccess)}
      >
        <Paper elevation={2} className="flex flex-col gap-y-6 w-full p-8">
          <h1>Hello, new friend</h1>
          {/* username filed */}
          <TextField
            {...register("username", {
              validate: {
                startWithLetter: (v) =>
                  /^[a-zA-Z]/.test(v) || "Must start with a letter",
                containValidChar: (v) =>
                  /^[\w-]+$/.test(v) ||
                  "Only letters, numbers, hyphens, underscores are allowed",
                fourToTwentyFour: (v) =>
                  /.{4,24}$/.test(v) || "4 to 24 in length",
              },
              required: { value: true, message: "This is required." },
            })}
            label="User Name"
            size="small"
            error={errors["username"] != undefined}
            helperText={errors["username"] ? errors["username"].message : ""}
            className="max-w-lg"
          />
          {/* Email field */}
          <TextField
            {...register("email", {
              pattern: {
                value: EMAIL_REGEX,
                message: "Invalid email address.",
              },
              required: { value: true, message: "This is required." },
            })}
            label="Email"
            size="small"
            error={errors["email"] != undefined}
            helperText={errors["email"] ? errors["email"].message : ""}
            className="max-w-lg"
          />
          {/* Password field */}
          <FormControl
            variant="outlined"
            error={errors["password"] != undefined}
            size="small"
          >
            <InputLabel htmlFor="password">Password</InputLabel>
            <OutlinedInput
              id="password"
              {...register("password", {
                validate: {
                  containOneLowerCase: (v) =>
                    /^(?=.*[a-z])/.test(v) ||
                    "Must contain at least 1 lower-case letter",
                  containOneUpperCase: (v) =>
                    /^(?=.*[A-Z])/.test(v) ||
                    "Must contain at least 1 upper-case letter",
                  containOneNumber: (v) =>
                    /^(?=.*[0-9])/.test(v) || "Must contain at least 1 number",
                  containOneSpecial: (v) =>
                    /^(?=.*[!@#$%])/.test(v) ||
                    "Must contain at least 1 special symbol (!@#$%)",
                  fourToTwentyFour: (v) =>
                    /.{8,24}$/.test(v) || "8 to 24 in length",
                },
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
          <Button type="submit">create</Button>
        </Paper>
      </form>
    </div>
  );
}

export default Register;
