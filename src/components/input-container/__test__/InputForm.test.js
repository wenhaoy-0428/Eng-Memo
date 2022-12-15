import { render, screen, waitFor, act } from "@testing-library/react";
import user from "@testing-library/user-event";
import axios from "axios";
import InputForm, { inputPresets } from "../InputForm";

// Automatically mock the axios module.
jest.mock("axios");

beforeEach(() => {
  jest.useRealTimers();
});

// jest.spyOn(global, "setTimeout");

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @brief: A helper function to write a word to the specified input field.
 * @param filedName: Indicates which input filed to write the word in. word | quote | tag | link
 * @param value: The value to write in.
 * @return: An array that contains the  element and the input word.
 */
const writeToInputField = (fieldName, value) => {
  // generate a random word
  let randomWords = require("random-words");
  const word = value ? value : randomWords();
  // a placeholder for the
  let field = undefined;
  if (fieldName === "word") {
    field = screen.getByPlaceholderText(inputPresets[fieldName].placeholder);
  } else {
    field = screen.getByLabelText(inputPresets[fieldName].label);
  }
  user.type(field, word);
  return [field, word];
};

describe("InputFormSuite", () => {
  /**
   * @brief: Test Input Field's initial value.
   * @exp: empty string.
   */
  it("INPUT_FORM_TC_001", () => {
    render(<InputForm />);
    const inputFiled = screen.getByPlaceholderText(
      inputPresets.word.placeholder
    );
    expect(inputFiled.textContent).toEqual("");
  });

  /**
   * @brief: Test the initial state of DropDown.
   * @exp: Hided.
   */
  it("INPUT_FORM_TC_002", () => {
    render(<InputForm />);
    // ! getBy methods will throw an error when they can't find an element.
    const quoteInput = screen.queryByLabelText(inputPresets.quote.label);
    const tagInput = screen.queryByLabelText(inputPresets.tag.label);
    const linkInput = screen.queryByLabelText(inputPresets.rLink.label);
    expect(quoteInput).toBeNull();
    expect(tagInput).toBeNull();
    expect(linkInput).toBeNull();
  });

  /**
   * @brief: Test the state of DropDownButton after menuButton is clicked
   * @exp: Appear.
   */
  it("INPUT_FORM_TC_003", async () => {
    render(<InputForm />);
    const dropDownBtn = screen.getByTestId("DropDownBtn");
    // click
    user.click(dropDownBtn);
    const quoteInput = screen.queryByLabelText(inputPresets.quote.label);
    const tagInput = screen.queryByLabelText(inputPresets.tag.label);
    const linkInput = screen.queryByLabelText(inputPresets.rLink.label);
    await waitFor(() => {
      expect(quoteInput).toBeInTheDocument();
      expect(tagInput).toBeInTheDocument();
      expect(linkInput).toBeInTheDocument();
    });
  });

  /**
   * @brief: Test submitting when the wordInput is empty.
   * @exp: The submission is not triggered.
   */
  it("INPUT_FORM_TC_004", async () => {
    render(<InputForm />);

    // expect(screen.queryByTestId("addIcon")).not.toBeNull();
    const submitBtn = screen.queryByTestId("submitBtn");
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["word"].placeholder).value
      ).toEqual("");
    });
    expect(screen.queryByTestId("addIcon")).not.toBeNull();
    user.click(submitBtn);
    expect(axios.put.mock.calls.length).toBe(0);
  });

  /**
   * @brief: Test InputFiled's value when user inputs.
   * @exp: equal to user input
   */
  it("INPUT_FORM_TC_005", async () => {
    /**
     * ! This test case uses `async` and `waitFor` to solve `not wrapped by act error`
     * for more details refer to
     * https://wenhaoy-0428.github.io/Docs/#/FrontEnd/React/testNotes?id=not-wrapped-in-act-errors
     */
    render(<InputForm />);
    const [wordInput, word] = writeToInputField("word");
    await waitFor(() => {
      expect(wordInput.value).toEqual(word);
    });
    // click on the menu button
    const dropDownBtn = screen.getByTestId("DropDownBtn");
    user.click(dropDownBtn);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["tag"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["quote"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["rLink"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(screen.queryByTestId("addIcon")).not.toBeNull();
    });
  });

  /**
   * @brief: Test submitBtn appearance when loading.
   * @exp: A progress circle appears, and the submit button is disabled.
   */
  it("INPUT_FORM_TC_006", async () => {
    render(<InputForm />);
    axios.put.mockImplementation(async () => {
      console.log("MOCKED PUT");
      // 2s loading time
      await timeout(1000);
      return Promise.resolve();
    });

    const [wordInput, word] = writeToInputField("word");
    await waitFor(() => {
      expect(wordInput.value).toEqual(word);
    });

    // click on the menu button
    const dropDownBtn = screen.getByTestId("DropDownBtn");
    user.click(dropDownBtn);
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["tag"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["quote"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(inputPresets["rLink"].placeholder).value
      ).toEqual("");
    });
    await waitFor(() => {
      expect(screen.getByTestId("addIcon"));
    });

    const submitBtn = screen.getByTestId("submitBtn");

    // before submit
    expect(submitBtn).toBeEnabled();
    expect(screen.queryByTestId("progressCircle")).toBeNull();

    // click submit Button
    user.click(submitBtn);
    // done();
    // Submitbutton
    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
      expect(screen.getByTestId("progressCircle"));
    });
    // after submission
    await waitFor(() => {
      expect(screen.queryByTestId("progressCircle")).toBeNull();
    });
  });

  /**
   * @brief: Test submitBtn appearance after submission is successful
   * @exp: A check icon appears.
   */
  it("INPUT_FORM_TC_007", async () => {
    jest.useFakeTimers();
    render(<InputForm />);
    axios.put.mockImplementation(async () => {
      console.log("MOCKED PUT");
      return Promise.resolve();
    });

    const [wordInput, word] = writeToInputField("word");
    await waitFor(() => {
      expect(wordInput.value).toEqual(word);
    });

    const submitBtn = screen.getByTestId("submitBtn");
    // click submit Button
    user.click(submitBtn);
    await waitFor(() => {
      expect(screen.queryByTestId("checkIcon")).not.toBeNull();
    });
    // ! adding await will cause the event hoop to be stuck for settimeout in the submitForm promise.
    jest.advanceTimersByTime(3000);
    await waitFor(() => {
      expect(screen.queryByTestId("checkIcon")).toBeNull();
    });
  });

  /**
   * @brief: Test submitBtn appearance after submission is failed
   * @exp: The A cross Icon appears.
   */
  it("INPUT_FORM_TC_008", async () => {
    jest.useFakeTimers();
    render(<InputForm />);
    axios.put.mockImplementation(async () => {
      console.log("MOCKED PUT");
      return Promise.reject();
    });

    const [wordInput, word] = writeToInputField("word");
    await waitFor(() => {
      expect(wordInput.value).toEqual(word);
    });

    // click submit Button
    user.click(screen.getByTestId("submitBtn"));
    await waitFor(() => {
      // ! The reason to have this query inside the waitFor is that
      // ! before clicking the submit button this element was not mounted yet, thus checkIcon is NULL
      expect(screen.queryByTestId("crossIcon")).not.toBeNull();
    });
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    await waitFor(() => {
      expect(screen.queryByTestId("crossIcon")).toBeNull();
    });
  });

  /**
   * @brief: Test submitting when the wordInput is not empty.
   * @exp: The submission is triggered.
   */
  it("INPUT_FORM_TC_009", async () => {
    render(<InputForm />);
    // Write a word to wordInput
    const [wordInput, word] = writeToInputField("word");
    // Expect the value is written.
    await waitFor(() => {
      expect(wordInput.value).toEqual(word);
    });
    // click the submitButton
    const submitBtn = screen.queryByTestId("submitBtn");
    user.click(submitBtn);
    // expect submission is called once.
    await waitFor(() => {
      expect(axios.put.mock.calls.length).toBe(1);
    });
  });

  /**
   * @brief: Test submitting when the linkInput is invalid.
   * @exp: The submission is not triggered.
   */
  it("INPUT_FORM_TC_010", () => {
    render(<InputForm />);
    // Write a word to wordInput
    const [wordInput, word] = writeToInputField("word");
    expect(wordInput.value).toEqual(word);
    // click on the menu button
    const dropDownBtn = screen.getByTestId("DropDownBtn");
    user.click(dropDownBtn);
    // write random to word to link
    const [linkInput, link] = writeToInputField("rLink");
    expect(linkInput.value).toEqual(link);
    // click the submitButton
    const submitBtn = screen.queryByTestId("submitBtn");
    user.click(submitBtn);
    expect(axios.put.mock.calls.length).toBe(0);
  });

  /**
   * @brief: Test submitting when everything is valid
   * @exp: The submission is triggered.
   */
  it("INPUT_FORM_TC_011", async () => {
    render(<InputForm />);
    // Write a word to wordInput
    const [wordInput, word] = writeToInputField("word");
    expect(wordInput.value).toEqual(word);

    // click on the menu button
    const dropDownBtn = screen.getByTestId("DropDownBtn");
    user.click(dropDownBtn);

    const [quoteInput, quote] = writeToInputField("quote");
    expect(quoteInput.value).toEqual(quote);

    const [tagInput, tag] = writeToInputField("tag");
    expect(tagInput.value).toEqual(tag);

    const [linkInput, link] = writeToInputField(
      "rLink",
      "https://www.google.com"
    );
    expect(linkInput.value).toEqual(link);
    // click the submitButton
    const submitBtn = screen.queryByTestId("submitBtn");
    user.click(submitBtn);
    await waitFor(() => {
      expect(axios.put.mock.calls.length).toBe(1);
    });
  });
});
