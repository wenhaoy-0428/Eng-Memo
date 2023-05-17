import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  add,
  format,
  getDate,
  getDaysInMonth,
  getMonth,
  getYear,
  parseISO,
  startOfMonth,
  sub,
} from "date-fns";
import { IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { motion, AnimatePresence } from "framer-motion";

import Cell from "./Cell";

import EarthIcon from "./Assets/EarthIcon.png";
import MoonIcon from "./Assets/MoonIcon.png";
import SunIcon from "./Assets/SunIcon.png";
import JupiterIcon from "./Assets/JupiterIcon.png";
import SaturnIcon from "./Assets/SaturnIcon.png";
import UranusIcon from "./Assets/UranusIcon.png";
import NeptuneIcon from "./Assets/NeptuneIcon.png";
import MarsIcon from "./Assets/MarsIcon.png";
import MercuryIcon from "./Assets/MercuryIcon.png";

import { useFetcher, useLoaderData } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const API_GET_MILESTONE_BY_MONTH = "/api/get-milestone-by-month/";
const GALAXY_ICONS = [
  SunIcon,
  EarthIcon,
  MoonIcon,
  SaturnIcon,
  JupiterIcon,
  UranusIcon,
  MarsIcon,
  NeptuneIcon,
  MarsIcon,
  MercuryIcon,
];

export default function MileStone() {
  // data contains milestone of the current month when loading
  const data = useLoaderData();
  // a manual fetcher to call loader
  const fetcher = useFetcher();
  // user context
  const { user, setUser } = useUser();
  const [milestone, setMilestone] = useState(dataCleaner(data));

  const [_today, setToday] = useState(new Date());
  // The start Date of the month.
  const startDate = startOfMonth(_today);
  // The number of days in the month
  const numDays = getDaysInMonth(_today);
  // The number of days in a week before the start date of the month
  const prefixDays = (((startDate.getDay() - 1) % 7) + 7) % 7;
  // ! https://stackoverflow.com/questions/4467539/javascript-modulo-gives-a-negative-result-for-negative-numbers
  // getDay returns the day of the week of startDate which starts at 1.
  // minus 1 so when startDate is at Monday, we have no prefixDays

  // the direction of sliding
  const [direction, setDirection] = useState(0);

  // A helper function to convert milestone fetched from backend to an easier way to work with
  function dataCleaner(data) {
    return data.reduce((obj, { plannedAt, completed }) => {
      obj[getDate(parseISO(plannedAt))] = completed;
      return obj;
    }, {});
  }

  const prevMonth = () => {
    const newDate = sub(_today, { months: 1 });
    setToday(newDate);
    fetcher.load(`/milestone/${format(newDate, "yyyy-MM-dd")}`);
    setDirection(-1);
  };

  const nextMonth = () => {
    const newDate = add(_today, { months: 1 });
    setToday(newDate);
    fetcher.load(`/milestone/${format(newDate, "yyyy-MM-dd")}`);
    setDirection(1);
  };

  const animate_calendar = {
    enter: (direction) => {
      return {
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0.2,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0.2,
      };
    },
  };

  // side effect to update milestone when fetcher loads new data.
  useEffect(() => {
    if (fetcher.data !== undefined) {
      setMilestone(dataCleaner(fetcher.data));
    }
  }, [fetcher]);

  return (
    <div className="Milestone w-[80%] max-w-[400px] row-span-4 h-full relative font-NotoSansSC text-xl overflow-hidden">
      <div className="header flex justify-between items-center">
        <IconButton onClick={prevMonth}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        <h2 className="text-gray-800">
          {/* {date.toLocaleString("default", { month: "long", year: "numeric" })} */}
          {format(_today, "LLLL yyyy")}
        </h2>
        <IconButton onClick={nextMonth}>
          <KeyboardArrowRightIcon />
        </IconButton>
      </div>

      <div className="Calendar relative">
        {/* MON-SUN */}
        <div className="Weekdays flex gap-3 justify-center items-center mb-3">
          {DAYS_OF_WEEK.map((day) => (
            <Cell key={day} className="font-bold">
              {day}
            </Cell>
          ))}
        </div>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            className="Days w-full grid grid-cols-7 gap-x-3 auto-rows-fr justify-center items-center absolute"
            key={_today}
            custom={direction}
            variants={animate_calendar}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: {
                type: "spring",
                stiffness: 500,
                damping: 60,
                duration: 0.5,
              },
              opacity: { duration: 0.5 },
            }}
          >
            {/* empty placeholders */}
            {Array(prefixDays)
              .fill()
              .map((_, index) => (
                <Cell key={index} />
              ))}
            {/* days */}
            {Array(numDays)
              .fill()
              .map((_, index) => {
                return (
                  <Cell
                    key={index}
                    marked={index in milestone}
                    className="text-gray-500"
                  >
                    {milestone[index] ? (
                      <img src={GALAXY_ICONS[index % GALAXY_ICONS.length]} />
                    ) : (
                      index + 1
                    )}
                  </Cell>
                );
              })}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* when user reloads on this page, this component is rendered first before useEffect of App is called.
       Thus, user context is empty */}
      {user && (
        <div
          variant="outlined"
          className="flex justify-between absolute bottom-0 w-full"
        >
          <div className="flex flex-col justify-center items-center p-2">
            <span className=" text-blue-500 font-bold">
              {user["milestone_streak"]}
            </span>
            streak
          </div>
          <div className="flex flex-col justify-center items-center p-2">
            <span className=" text-blue-500 font-bold">
              {user["milestone_longestStreak"]}
            </span>
            LongestStreak
          </div>
          <div className="flex flex-col justify-center items-center p-2">
            <span className=" text-blue-500 font-bold">
              {user["milestone_total"]}
            </span>
            Total
          </div>
        </div>
      )}
    </div>
  );
}

export async function loadMilestone({ params }) {
  let date = parseISO(params.date);
  if (isNaN(date)) {
    throw { message: "Invalid param" };
  }
  try {
    const data = {
      month: getMonth(date) + 1,
      year: getYear(date),
    };
    let response = await axios.get(API_GET_MILESTONE_BY_MONTH, {
      params: data,
    });
    return response.data;
  } catch (e) {
    throw e;
  }
  return null;
}
