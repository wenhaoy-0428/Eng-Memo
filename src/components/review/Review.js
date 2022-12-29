import React, { useState, useRef, useEffect } from "react";
import reviewAnimation from "./ReviewAnimation.module.css";
import reviewCardAnimation from "./ReviewCardAnimation.module.css";
import quoteAnimationRight from "./QuoteAnimationRight.module.css";
import quoteAnimationLeft from "./QuoteAnimationLeft.module.css";

import Tag from "../common/Tag";

import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useLoaderData } from "react-router-dom";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import IconButton from "@mui/material/IconButton";

/**
 * The Review component  that contains the scheduled daily words to memorize.
 */
function Review() {
  const entries = useLoaderData();
  // The functional Buttons.
  const handleKW = () => {
    console.log("I know this word");
    setCrtEntryIdx(crtEntryIdx + 1);
  };

  const handleUC = () => {
    console.log("I am uncertain about this word");
  };

  const handleDN = () => {
    console.log("I dunno this word");
  };

  const funBtns = [
    { label: "Know", color: "green", handler: handleKW },
    { label: "Uncertain", color: "orange", handler: handleUC },
    { label: "Dunno", color: "red", handler: handleDN },
  ];

  // The normal width of the tag indicator.
  let indicatorOffsetWidth = 10;
  // The index of the current Entry.
  const [crtEntryIdx, setCrtEntryIdx] = useState(0);
  let entry = entries[crtEntryIdx];
  // ! entry is only temporary.
  // The index of the current Quote, used as the key of CSSTransition.
  const [crtQuoteIdx, setCrtQuoteIdx] = useState(0);
  // The dynamic height of the QuoteContainer
  const [quoteContainerHeight, setQuoteContainerHeight] = useState();
  // The direction of the Quote sliding.
  const [direction, setDirection] = useState(quoteAnimationRight);
  // The refs to all tags.
  const tagRefs = useRef([]);
  // The absolute position offset from the left of the tag indicator.
  const [indicatorOffset, setIndicatorOffset] = useState(null);
  // The width of the tag indicator. Disappeared (0 width) When associated tag is undefined.
  const [indicatorWidth, setIndicatorWidth] = useState(null);
  // Extra animation styles for review container when switching entries.
  const [extraRCAttr, setExtraRCAttr] = useState("border-0");

  /**
   * Handles state changes for sliding to the previous quote.
   */
  const goToPrevQuote = () => {
    console.log("Clicked Prev-Quote Button");
    if (crtQuoteIdx <= 0) {
      return;
    }
    setDirection(quoteAnimationLeft);
    setCrtQuoteIdx(crtQuoteIdx - 1);
  };

  /**
   * Handles state changes for sliding to the next quote.
   */
  const goToNextQuote = () => {
    console.log("Clicked Next-Quote Button");
    if (crtQuoteIdx >= entry.occurrences.length - 1) {
      return;
    }
    setDirection(quoteAnimationRight);
    setCrtQuoteIdx(crtQuoteIdx + 1);
  };

  /**
   * Apply animation to shift tag indicator to next tag.
   * @param {*} newIndicatorWidth The new width for the indicator that span from current tag to next tag.
   * @param {*} newIndicatorOffset The new left offset that positions the indicator beneath the new tag.
   */
  const shiftIndicatorRight = (newIndicatorWidth, newIndicatorOffset) => {
    setIndicatorWidth(newIndicatorWidth);
    setTimeout(() => {
      setIndicatorWidth(indicatorOffsetWidth);
      setIndicatorOffset(newIndicatorOffset);
    }, 300);
  };

  /**
   * Apply animation to shift tag indicator to previous tag.
   * @param {*} newIndicatorWidth The new width for the indicator that span from current tag to prev tag.
   * @param {*} newIndicatorOffset The new left offset that positions the indicator beneath the new tag.
   */
  const shiftIndicatorLeft = (newIndicatorWidth, newIndicatorOffset) => {
    setIndicatorWidth(newIndicatorWidth);
    setIndicatorOffset(newIndicatorOffset);
    setTimeout(() => {
      setIndicatorWidth(indicatorOffsetWidth);
      setIndicatorOffset(newIndicatorOffset);
    }, 300);
  };

  /**
   * The CSSTransition OnEnter callback function that adjust the height of the QuoteContainer
   * dynamically according to the quote node.
   * @param {*} node: The current quote node to be shown.
   */
  const handleQuoteContainerHeight = (node) => {
    setQuoteContainerHeight(node.clientHeight);
  };

  /**
   * Dynamically adjust tag indicator according to the sliding quotes.
   */
  useEffect(() => {
    let currentTag = tagRefs.current[crtQuoteIdx];
    if (currentTag) {
      // This offset centers the indicator bar underneath the new tag.
      let newIndicatorOffset =
        currentTag.offsetLeft +
        (currentTag.offsetWidth - indicatorOffsetWidth) / 2;
      // Apply no animation when first mounted.
      if (indicatorOffset === null || indicatorWidth === null) {
        setIndicatorWidth(indicatorOffsetWidth);
        setIndicatorOffset(newIndicatorOffset);
        return;
      }
      // The new indicator width that span from current offset to new offset.
      let newIndicatorWidth =
        Math.abs(newIndicatorOffset - indicatorOffset) + indicatorOffsetWidth;
      // Apply animation based on direction.
      if (direction === quoteAnimationRight) {
        shiftIndicatorRight(newIndicatorWidth, newIndicatorOffset);
      } else {
        shiftIndicatorLeft(newIndicatorWidth, newIndicatorOffset);
      }
    } else {
      // Disappeared (0 width) When associated tag is undefined.
      setIndicatorWidth(0);
    }
  }, [crtQuoteIdx]);

  return (
    <div
      data-testid="review-container"
      className={`ReviewContainer relative row-span-4 w-[600px] max-w-[95vw] h-full border-solid border-slate-200 rounded-lg ${extraRCAttr} ${reviewAnimation.ReviewContainer}`}
    >
      <TransitionGroup component={null}>
        <CSSTransition
          key={crtEntryIdx}
          timeout={1500}
          onEnter={() => {
            setExtraRCAttr("border-4 bg-slate-200 overflow-hidden");
          }}
          onEntered={() => {
            setExtraRCAttr("border-0");
          }}
          classNames={{ ...reviewCardAnimation }}
        >
          <div className="ReviewCard absolute h-full w-full p-3 flex flex-col rounded-lg bg-white shadow-2xl">
            {/* TODO: link to word details */}
            <a className="WordDetail">
              <h2 className="text-center grow-0">{entry.key}</h2>
            </a>
            <div className="QuoteContainer">
              <h3>Quotes</h3>
              <div className="QuoteGallery flex items-center justify-center gap-1 overflow-hidden">
                <IconButton aria-label="before" onClick={goToPrevQuote}>
                  <NavigateBeforeIcon />
                </IconButton>
                <TransitionGroup
                  // height is dynamically adjusted below.
                  style={{ height: quoteContainerHeight }}
                  // ! https://wenhaoy-0428.github.io/Docs/#/FrontEnd/React/libraryNotes?id=dynamic-sliding-direction
                  childFactory={(child) =>
                    React.cloneElement(child, { classNames: { ...direction } })
                  }
                  className={`grow self-start overflow-hidden relative ${reviewAnimation.QuoteContainer}`}
                >
                  <CSSTransition
                    appear
                    key={crtQuoteIdx}
                    timeout={800}
                    // dynamically adjust container height.
                    onEnter={handleQuoteContainerHeight}
                    classNames={{ ...direction }}
                  >
                    <div className="break-all w-full absolute max-h-44 overflow-y-auto">
                      {entry.occurrences[crtQuoteIdx].quote}
                    </div>
                  </CSSTransition>
                </TransitionGroup>

                <IconButton aria-label="next" onClick={goToNextQuote}>
                  <NavigateNextIcon />
                </IconButton>
              </div>
            </div>
            <div className="TagContainer relative">
              <h3>Tags</h3>
              <div className="flex gap-x-1 p-2">
                {/* https://beta.reactjs.org/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback */}
                {entry.occurrences.map((occurrence, idx) => {
                  if (occurrence.tag) {
                    return (
                      <Tag
                        ref={(el) => {
                          tagRefs.current[idx] = el;
                        }}
                        key={idx}
                        link={occurrence.link}
                      >
                        {occurrence.tag}
                      </Tag>
                    );
                  }
                })}
              </div>
              {/* Tag Indicator */}
              <span
                style={{ left: indicatorOffset, width: indicatorWidth }}
                className={`h-[2px] bg-green-400 absolute bottom-0 rounded-xl ${reviewAnimation.TagIndicator}`}
              ></span>
            </div>

            <div className="FunButtonContainer w-full absolute bottom-3 left-0 flex justify-around">
              {funBtns.map((btn) => (
                <FunButton
                  key={btn.label}
                  label={btn.label}
                  color={btn.color}
                  eventHandler={btn.handler}
                />
              ))}
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

/**
 * Functional Button Component.
 * @param label: The label on the button. Know | Uncertain | Dunno
 * @param color: The border/text color.
 * @param eventHandler: The callback function that handles click event.
 */
function FunButton({ label, color, eventHandler }) {
  const colorOptions = {
    green: "text-green-500  border-green-500",
    orange: "text-orange-500 border-orange-500",
    red: "text-rose-500 border-rose-500",
  };
  return (
    <button
      className={`border-solid border-2 bg-inherit hover:cursor-pointer h-10 w-[30%] ${colorOptions[color]} ${reviewAnimation.FunBtn}`}
      onClick={eventHandler}
    >
      <div className={reviewAnimation.Label}>{label}</div>
    </button>
  );
}

export default Review;
