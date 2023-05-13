import { Paper, Button, InputBase, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNotification } from "../../../contexts/NotificationContext";
import axios from "axios";

const FILTER_OPTIONS = ["Word", "Tag"];
const API_SEARCH_RECORDS = "/api/search-records/";

export default function SearchBar({ updateHandler, searchStatusHandler }) {
  const [filterIndex, setFilterIndex] = useState(0);
  const filter = FILTER_OPTIONS[filterIndex];
  const { newNotification } = useNotification();
  const {
    register,
    handleSubmit,
    formState: { isLoading },
  } = useForm();

  const onSuccess = async (data) => {
    data = { ...data, filter: filter };
    try {
      let response = await axios.post(API_SEARCH_RECORDS, data);
      updateHandler(response.data);
    } catch (e) {
      newNotification("An internal error occurred.", "error");
    }
  };

  const onError = async (error) => {
    if (error.search) {
      newNotification(error.search.message, "error");
    }
  };

  useEffect(() => {
    searchStatusHandler(isLoading);
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit(onSuccess, onError)}>
      <Paper
        variant="outlined"
        className="SearchBar flex items-center gap-1 justify-left w-full h-10 my-3 shadow-sm"
      >
        <Button
          variant="text"
          className="h-full w-[80px] rounded-none normal-case shadow-none"
          onClick={() => {
            setFilterIndex((filterIndex + 1) % FILTER_OPTIONS.length);
          }}
        >
          By {filter}
        </Button>

        <Divider className="h-6" orientation="vertical" />

        <InputBase
          placeholder="Search..."
          {...register("search", {
            required: {
              value: true,
              message: "Search field can not be empty.",
            },
          })}
        />
      </Paper>
    </form>
  );
}
