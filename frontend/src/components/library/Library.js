import axios from "axios";
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
import DeleteIcon from "@mui/icons-material/Delete";
import { Checkbox, TextField } from "@mui/material";

import Tag from "../common/Tag";
import CircularProgressBar from "../common/CircularProgressBar";
import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * The component Library that contains all the word entries the user ever stored.
 */
function Library() {
  let location = useLocation();
  // The data fetched from loader when navigation arrives at this page
  const [records, setRecords] = useState(useLoaderData().data);

  // Fetcher that is used to manually call loader
  const fetcher = useFetcher();
  // An dic that stores all selected quotes with True, and ever selected quotes with False,
  // meaning never selected quotes don't exist in this dic
  const [selectedQuotes, setSelectedQuotes] = useState({});

  const { newNotification } = useNotification();

  /**
   * A helper function that pass along the chain to enable children to add new selected quotes
   * @param {*} newSelectedQuotes: An object that have quote.pk and bool pairs
   */
  const setSelectedQuoteHelper = (newSelectedQuotes) => {
    setSelectedQuotes({ ...selectedQuotes, ...newSelectedQuotes });
  };

  /**
   * A helper function that allows children to query if a quote is currently selected
   * @param {*} quote: The quote.pk to search for
   * @returns True if the quote exists in the dic and is selected | False otherwise
   */
  const getSelectedQuoteHelper = (quote) => {
    // when undefined return false
    return selectedQuotes[quote] ? selectedQuotes[quote] : false;
  };

  /**
   * A helper function that filter selected quotes.
   * @returns A quotes that are currently being selected.
   */
  const getAllSelectedQuotes = () => {
    return Object.keys(selectedQuotes).reduce((truthyQuotes, pk) => {
      if (selectedQuotes[pk]) {
        truthyQuotes.push(pk);
      }
      return truthyQuotes;
    }, []);
  };

  const handleDelete = () => {
    let data = getAllSelectedQuotes();
    if (window.confirm(`${data.length} quotes will be deleted`)) {
      axios
        .put("/api/deleteQuotes/", data)
        .then(() => {
          newNotification("Successfully deleted", "success");
          // empty selectedQuotes
          setSelectedQuotes({});
          fetcher.load(location["pathname"]);
        })
        .catch((e) => {
          newNotification("An error occurred", "error");
        });
    }
  };

  // a variant that defines the animation of toolbar
  const animate_toolbar = {
    hidden: {
      height: 0,
    },
    appear: {
      height: "auto",
    },
  };

  // update Library Rows when changes.
  useEffect(() => {
    if (fetcher.data) {
      setRecords(fetcher.data.data);
    }
  }, [fetcher.data]);

  return (
    <div data-testid="library-container" className="w-[90%] max-w-[500px]">
      <AnimatePresence>
        {getAllSelectedQuotes().length > 0 && (
          <motion.div
            variants={animate_toolbar}
            initial="hidden"
            animate="appear"
            exit="hidden"
            className="overflow-hidden"
          >
            <ToolBar handleDelete={handleDelete} />
          </motion.div>
        )}
      </AnimatePresence>

      <TableContainer component={Paper} className="w-full">
        <Table className="w-full table-fixed overflow-hidden">
          <TableHead>
            <TableRow>
              <TableCell className="w-[15%]" />
              <TableCell align="center" className="w-[30%]">
                Word
              </TableCell>
              <TableCell align="center" className="w-[35%]">
                Date Added
              </TableCell>
              <TableCell align="center" className="w-[20%]">
                Mastery
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.map((row) => (
              <Row
                key={row.word}
                record={row}
                fetcher={fetcher}
                selectQuote={setSelectedQuoteHelper}
                getSelectedQuote={getSelectedQuoteHelper}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
/**
 * @param record: A record row that displays information of the record
 * @param fetcher: A handler to manually fetch data from Library Loader
 * @param selectQuote: A handler that used to select a quote globally inside LibraryPage
 * @param getSelectedQuote: A helper function to get the selected quote with PK.
 */
function Row({ record, fetcher, selectQuote, getSelectedQuote }) {
  const [openRow, setOpenRow] = useState(false);
  /**
   * Calculate color of circular progress bar based on the mastery.
   * @param {*} mastery: describes how well the user knows the word.
   * @returns The color in hex
   */
  const calcProgressBarColor = (mastery) => {
    switch (true) {
      case mastery < 0.2:
        return "#cc3300";
      case mastery < 0.4:
        return "#ff9966";
      case mastery < 0.6:
        return "#ffcc00";
      case mastery < 0.8:
        return "#99cc33";
      case mastery <= 1:
        return "#339900";
      default:
        return "black";
    }
  };

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
        <TableCell component="th" scope="row" align="center">
          <b>{record.word}</b>
        </TableCell>
        <TableCell align="center">{record.date_added}</TableCell>
        <TableCell align="center">
          <CircularProgressBar
            strokeColor={calcProgressBarColor(record.mastery)}
            strokeWidth={3}
            progress={record.mastery}
          />
        </TableCell>
      </TableRow>
      <DetailRow
        record={record}
        openRow={openRow}
        getSelectedQuote={getSelectedQuote}
        selectQuote={selectQuote}
        fetcher={fetcher}
      />
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

  const { newNotification } = useNotification();

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
          newNotification("Changes have been saved.", "success");
          // recall library loader
          fetcher.load(location["pathname"]);
        })
        .catch((e) => {
          newNotification(`Submission Failure: ${e}`, "error");
        });
    } else {
      newNotification("No changes are made.", "info");
    }
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{ textTransform: "none" }}
        className="w-full"
      >
        <div className="text-ellipsis overflow-hidden whitespace-nowrap">
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
    </>
  );
}

function ToolBar({ handleDelete }) {
  return (
    <Paper
      variant="outlined"
      className="ToolBar overflow-hidden flex justify-end"
    >
      <IconButton
        onClick={handleDelete}
        aria-label="delete"
        color="error"
        sx={{ margin: 0.5 }}
      >
        <DeleteIcon />
      </IconButton>
    </Paper>
  );
}

/**
 * A nested row is a child of a normal library row which contains more information
 * @param openRow: A switch that toggles the appearance of the detailRow
 * @param record: The record that this detail row is belong to,  which contains record word and all associated quotes
 * @param getSelectedQuote: A helper function to get a selected quote with its pk.
 * @param selectQuote: A helper function to mark a quote as selected.
 * @param fetcher: A function allows us to manually trigger @link (loadLibrary) function
 */
function DetailRow({
  openRow,
  record,
  getSelectedQuote,
  selectQuote,
  fetcher,
}) {
  //
  let allSelected = record.quotes.reduce((selected, quote) => {
    return selected && getSelectedQuote(quote.pk);
  }, true);

  return (
    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        {/* Record Detail ROW */}
        <Collapse in={openRow} timeout="auto" unmountOnExit>
          <Box>
            <Table className="w-full table-fixed">
              <TableHead>
                <TableRow>
                  <TableCell align="center" className="w-[15%] ">
                    {/* Select ALL */}
                    <Checkbox
                      checked={allSelected}
                      onChange={(event) => {
                        let allQuote = {};
                        record.quotes.forEach((quote) => {
                          allQuote[quote.pk] = event.target.checked;
                        });
                        selectQuote(allQuote);
                      }}
                    />
                  </TableCell>
                  <TableCell align="left" className="w-[20%]">
                    Tag
                  </TableCell>
                  <TableCell align="center" className="w-[65%]">
                    Quote
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {record.quotes.map((quote, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        <Checkbox
                          checked={getSelectedQuote(quote.pk)}
                          onChange={(event) => {
                            selectQuote({ [quote.pk]: event.target.checked });
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        {quote.tag ? (
                          <Tag link={quote.link}>{quote.tag}</Tag>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {/* The Modal shows full quote */}
                        <QuoteDialog
                          word={record.word}
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
  );
}

export function loadLibrary() {
  return axios.get("/api/getLibrary/");
}

export default Library;
