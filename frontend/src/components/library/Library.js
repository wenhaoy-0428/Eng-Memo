import { useState, useRef, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import { useFetcher, useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox } from "@mui/material";

import { CSSTransition } from "react-transition-group";

import axios from "axios";

import Tag from "../common/Tag";
import ControlPanelStyles from "./CSS/LibraryControlPanel.module.css";

/**
 * The component Library that contains all the word entries the user ever stored.
 */
function Library() {
  let location = useLocation();
  // The data fetched from loader when navigation arrives at this page
  const [rows, setRows] = useState(useLoaderData().data);

  // Fetcher that is used to manually call loader
  const fetcher = useFetcher();
  // An dic that stores all selected quotes with True, and ever selected quotes with False,
  // meaning never selected quotes don't exist in this dic
  const [selectedQuote, setSelectedQuote] = useState({});

  /**
   * A helper function that pass along the chain to enable children to add new selected quotes
   * @param {*} selectedQuotes: An object that have quote.pk and bool pairs
   */
  const setSelectedQuoteHelper = (selectedQuotes) => {
    setSelectedQuote({ ...selectedQuote, ...selectedQuotes });
  };

  /**
   * A helper function that allows children to query if a quote is currently selected
   * @param {*} quote: The quote.pk to search for
   * @returns True if the quote exists in the dic and is selected | False otherwise
   */
  const getSelectedQuoteHelper = (quote) => {
    // when undefined return false
    return selectedQuote[quote] ? selectedQuote[quote] : false;
  };

  const handleDeleting = () => {
    let data = Object.keys(selectedQuote).reduce((truthyQuotes, pk) => {
      if (selectedQuote[pk]) {
        truthyQuotes.push(pk);
      }
      return truthyQuotes;
    }, []);
    if (window.confirm(`${data.length} quotes will be deleted`)) {
      axios
        .put("/api/deleteQuotes/", data)
        .then(() => {
          alert("Successfully deleted");
          fetcher.load(location["pathname"]);
        })
        .catch((e) => {
          alert(e);
        });
    }
  };

  // update Library Rows when changes.
  useEffect(() => {
    if (fetcher.data) {
      setRows(fetcher.data.data);
    }
  }, [fetcher.data]);

  return (
    <div data-testid="library-container">
      <CSSTransition
        in={Object.keys(selectedQuote).length}
        unmountOnExit
        timeout={800}
        classNames={{ ...ControlPanelStyles }}
      >
        <Paper variant="outlined" className="overflow-hidden flex justify-end">
          {/* <div className="p-2"> */}

          <IconButton
            onClick={handleDeleting}
            aria-label="delete"
            color="error"
            sx={{ margin: 0.5 }}
          >
            <DeleteIcon />
          </IconButton>
          {/* </div> */}
        </Paper>
      </CSSTransition>

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Word</TableCell>
              <TableCell align="right">Date Added</TableCell>
              <TableCell align="right">Times Reviewed</TableCell>
              <TableCell align="right">Familiarity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <Row
                key={row.word}
                row={row}
                fetcher={fetcher}
                selectQuote={setSelectedQuoteHelper}
                getSelectQuote={getSelectedQuoteHelper}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function Row({ row, fetcher, selectQuote, getSelectQuote }) {
  const [openRow, setOpenRow] = useState(false);
  let allSelected = row.quotes.reduce((selected, quote) => {
    return selected && getSelectQuote(quote.pk);
  }, true);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpenRow(!openRow)}
          >
            {openRow ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <b>{row.word}</b>
        </TableCell>
        <TableCell align="right">{row.date_added}</TableCell>
        <TableCell align="right">{row.times_reviewed}</TableCell>
        <TableCell align="right">{row.familiarity}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          {/* Record Detail ROW */}
          <Collapse in={openRow} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {/* Select ALL */}
                      <Checkbox
                        checked={allSelected}
                        onChange={(event) => {
                          let allQuote = {};
                          row.quotes.map((quote) => {
                            allQuote[quote.pk] = event.target.checked;
                          });
                          selectQuote(allQuote);
                        }}
                      ></Checkbox>
                    </TableCell>
                    <TableCell>Tag</TableCell>
                    <TableCell>Quote</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.quotes.map((quote, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Checkbox
                            checked={getSelectQuote(quote.pk)}
                            onChange={(event) => {
                              selectQuote({ [quote.pk]: event.target.checked });
                            }}
                          ></Checkbox>
                        </TableCell>

                        <TableCell>
                          {quote.tag ? (
                            <Tag link={quote.link}>{quote.tag}</Tag>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          {/* The Modal shows full quote */}
                          <QuoteDialog
                            word={row.word}
                            pk={quote.pk}
                            fetcher={fetcher}
                          >
                            {quote.value}
                          </QuoteDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

/**
 * This component renders the detail page of Quote that allows user to preview and edit the quote
 * @param {*} word: The word this quote is associated with
 * @param {*} pk: The primary key of current quote
 * @param {*} children: The nested node
 * @returns
 */
function QuoteDialog({ fetcher, word, pk, children }) {
  // Open the modal
  const [open, setOpen] = useState(false);
  // Toggles the save changes button that only shows the button when editing
  const [onChange, setOnChange] = useState(true);
  // uncontrolled form ref
  const quoteRef = useRef();

  let location = useLocation();

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    // setOnChange(false);
  };

  /**
   * Update the new quote
   */
  function submitQuoteChanges() {
    let newQuote = quoteRef.current.value;
    if (children !== newQuote) {
      let data = {
        value: newQuote,
        key: pk,
      };
      axios
        .patch("/api/updateQuote/", data)
        .then(() => {
          alert("Changes successfully saved.");
          // recall library loader
          fetcher.load(location["pathname"]);
        })
        .catch((e) => {
          alert(`Submission Failure: ${e}`);
        });
    } else {
      alert("No changes are made");
    }
  }

  return (
    <div>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{ textTransform: "none" }}
      >
        <div className="w-[300px] text-ellipsis overflow-hidden whitespace-nowrap">
          {children}
        </div>
      </Button>
      <Dialog maxWidth="sm" fullWidth onClose={handleClose} open={open}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          {word}
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TextField
            label="Preview"
            fullWidth
            multiline
            sx={{ marginTop: 1 }}
            defaultValue={children}
            onFocus={() => {
              setOnChange(true);
            }}
            inputRef={quoteRef}
          />
        </DialogContent>
        {onChange ? (
          <DialogActions>
            <Button onClick={submitQuoteChanges}>Save</Button>
          </DialogActions>
        ) : null}
      </Dialog>
    </div>
  );
}

export function loadLibrary() {
  return axios.get("/api/getLibrary/");
}

export default Library;
