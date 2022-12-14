import React, { useState, useEffect, useRef } from "react";
import { Formik, Field, Form } from "formik";
import axios from "axios";
import { object, string } from "yup";
import { SwitchTransition, CSSTransition } from "react-transition-group";

// MaterialUI
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import LibraryAddCheckOutlinedIcon from "@mui/icons-material/LibraryAddCheckOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import { green } from "@mui/material/colors";

import dropDownAnimation from "./DropDownAnimation.module.css";
import submitBtnAnimation from "./SubmitBtnAnimation.module.css";

/**
 * @brief: The default attributes for the inputs.
 */
const inputPresets = {
  word: {
    placeholder: "Add Words and Phrases",
  },
  quote: {
    placeholder: "Add your quote here",
    label: "Quote",
  },
  tag: {
    placeholder: "MDN",
    label: "Tag",
  },
  rLink: {
    placeholder: "https://",
    label: "Link",
  },
};

const status = {
  success: 0,
  failure: 1,
  neutral: 2,
  loading: 3,
};
/**
 * @brief: InputForm Component
 */
function InputForm() {
  // The status of the form.
  const [formStatus, setFormStatus] = useState(status.neutral);
  // The state of the dropDown menu.
  const [openDropDown, setOpenDropDown] = useState(false);
  // The switch that toggles the animation of the submitBtn
  const [switchSubmitBtn, setSwitchSubmitBtn] = useState(false);

  /**
   * @brief: Toggle DropDown menu when menu button is clicked.
   */
  const toggleDropDown = () => {
    setOpenDropDown(!openDropDown);
    console.log(`Menu ${openDropDown ? "closed" : "opened"}`);
  };

  /**
   * @brief:
   * @param values: An object contains all the user inputs.
   * @return:
   */
  const submitForm = (values) => {
    console.log(JSON.stringify(values, null, 2));

    setFormStatus(status.loading);

    // handle request.
    axios
      .put("#", values)
      .then(() => {
        console.log("Submission Success");
        setFormStatus(status.success);
        // TODO: reset the form.
      })
      .catch((e) => {
        console.log(`Submission Failure: ${e}`);
        setFormStatus(status.failure);
      })
      .then(() => {
        console.log("Submission CleanUp");
        setTimeout(() => {
          console.log("Neutralizing Form");
          setFormStatus(status.neutral);
          // tell to animate.
          setSwitchSubmitBtn(!switchSubmitBtn);
        }, 2000);
      });
  };

  // ! FOR TEST ONLY
  const devSubmitForm = (values) => {
    setFormStatus(status.loading);
    setTimeout(() => {
      setFormStatus(status.success);
    }, 1000);
  };

  // ! FOR TEST ONLY
  const toggleSuccess = () => {
    setFormStatus(status.neutral);
    // toggle animation
    setSwitchSubmitBtn(!switchSubmitBtn);
  };

  return (
    <div className="InputForm relative w-4/5 max-w-xl">
      {/* Use Formik library to implement form, 
      check this link https://formik.org/docs/tutorial for a comprehensive tutorial */}
      <Formik
        initialValues={{ word: "", quote: "", tag: "", rLink: "" }}
        validationSchema={object({
          word: string().required("Required"),
          rLink: string().url("Link must be a valid URL").nullable(),
        })}
        onSubmit={submitForm}
      >
        {/* Use Children of Formik to get more props */}
        {({ handleSubmit, errors }) => (
          <Form>
            {/* InputBar */}
            <Paper className="InputBar flex items-center relative z-50 h-10">
              <Tooltip title="Menu">
                <IconButton
                  aria-label="menu"
                  data-testid="DropDownBtn"
                  onClick={toggleDropDown}
                  className="DropDownBtn"
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
              <Field
                name="word"
                type="text"
                as={InputBase}
                placeholder={inputPresets.word.placeholder}
                autoFocus
                className="WordInput flex-1"
              />
              <Divider className="h-6" orientation="vertical" />
              {/* Give this a better name */}
              <SubmitBtn
                formStatus={formStatus}
                errors={errors}
                switchSubmitBtn={switchSubmitBtn}
                handleSubmit={handleSubmit}
              />
            </Paper>
            {/* Drop down menu */}
            <CSSTransition
              in={openDropDown}
              unmountOnExit
              timeout={800}
              classNames={{ ...dropDownAnimation }}
            >
              <InputFormDropDown errors={errors} />
            </CSSTransition>
          </Form>
        )}
      </Formik>
    </div>
  );
}

/**
 * @brief: The submit button component
 * @param formStatus: The current status of the form. success | failure | neutral | loading
 * @param errors: The validation result of input fields.
 * @param switchSubmitBtn: A switch used for icon animation that switches its state when
 *  formStatus shifts from loading to [success|failure].
 * @param handleSubmit: A callback function to submit the form.
 */
function SubmitBtn({ formStatus, errors, switchSubmitBtn, handleSubmit }) {
  const handleButtonClick = () => {
    console.log("Submit Button Clicked");
    handleSubmit();
  };
  /**
   * @brief: Determine the icon for the submit button based on the form status.
   * @param formStatus: The current status of the form. success | failure | neutral | loading
   * @return: Returns the corresponding icon for rendering.
   */
  const renderSubmitIcon = (formStatus) => {
    switch (formStatus) {
      case status.success:
        return (
          <CheckCircleOutlineIcon
            sx={{ color: green[500] }}
            data-testid="checkIcon"
          />
        );
      case status.failure:
        return (
          <ErrorOutlineOutlinedIcon color="error" data-testid="crossIcon" />
        );
      default:
        return <LibraryAddCheckOutlinedIcon data-testid="addIcon" />;
    }
  };

  return (
    <Tooltip title="Add">
      <div className="SubmitBtnWrapper relative overflow-hidden">
        <SwitchTransition>
          <CSSTransition
            // Switch Transition Happens only when we switch success from true to false
            key={switchSubmitBtn}
            timeout={800}
            classNames={{ ...submitBtnAnimation }}
          >
            <IconButton
              aria-label="submit"
              color={objIsEmpty(errors) ? "primary" : "error"}
              onClick={handleButtonClick}
              data-testid="submitBtn"
              className="SubmitBtn"
              disabled={formStatus != status.neutral}
            >
              {renderSubmitIcon(formStatus)}
            </IconButton>
          </CSSTransition>
        </SwitchTransition>
        {formStatus === status.loading && (
          <CircularProgress
            size={22}
            sx={{
              color: green[500],
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-11px",
              marginLeft: "-11px",
            }}
            data-testid="progressCircle"
          />
        )}
      </div>
    </Tooltip>
  );
}

/**
 * @brief: The Drop-down menu for inputForm.
 * @prop errors: The drilling errors of the form.
 */
function InputFormDropDown({ errors }) {
  return (
    <>
      <Paper className="InputFormDropDown grid grid-cols-[1fr_2fr] gap-4 p-3 absolute top-0 z-10 overflow-hidden">
        <Field
          name="quote"
          as={TextField}
          multiline
          label={inputPresets.quote.label}
          placeholder={inputPresets.quote.placeholder}
          maxRows={10}
          className="QuoteInput col-span-2"
        />

        <Field
          name="tag"
          as={TextField}
          type="text"
          label={inputPresets.tag.label}
          placeholder={inputPresets.tag.placeholder}
          className="TagInput"
        />

        <Field
          error={!objIsEmpty(errors) && errors["rLink"] ? true : false}
          name="rLink"
          as={TextField}
          type="url"
          label={inputPresets.rLink.label}
          placeholder={inputPresets.rLink.placeholder}
          helperText={errors["rLink"]}
          className="LinkInput"
        />
      </Paper>
    </>
  );
}

function usePrev(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/**
 * @brief: A helper function that check if the input is an empty object
 * @param obj: The test target.
 * @return: true if obj is empty and false otherwise.
 * @throws: when the input is not an object.
 */
const objIsEmpty = (obj) => {
  if (typeof obj === "string") {
    throw "Input is not an Object";
  }
  return Object.keys(obj).length === 0;
};

export default InputForm;
export { inputPresets };
