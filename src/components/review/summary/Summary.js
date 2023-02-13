import React, { useEffect, useRef, useState } from "react";
import UpperPrinter from "../printer-svg/upper";
import MidPrinter from "../printer-svg/mid";
import LowerPrinter from "../printer-svg/lower";

import { CSSTransition } from "react-transition-group";
import "./PrinterAnimation.css";
import { createPortal } from "react-dom";

import Modal from "../../common/Modal";

const animationTimeOut = 2000;

function Summary() {
  let score = 100;

  //TODO: RENAME
  const [temp, setTemp] = useState(true);

  const [isPrinted, setIsPrinted] = useState(false);

  const reviewPage = document.getElementById("review-page");
  const [topD, setTopD] = useState("top-0");
  // const [finished, setFinished] = useState(false);

  return (
    <div
      id="summary-container"
      className="SummaryContainer w-full relative grid grid-cols-1 justify-items-center content-start gap-0"
    >
      <div className="relative h-[120px] w-[400px] overflow-hidden bottom-[-1px]">
        <UpperPrinter className="w-full h-auto absolute bottom-0" />
        <CSSTransition
          classNames={"BlankPaper"}
          in={temp}
          timeout={animationTimeOut}
          unmountOnExit
        >
          <div className="w-[240px] h-[120px] border-solid border-black absolute border bg-white bottom-0 ml-auto mr-auto left-0 right-0"></div>
        </CSSTransition>
      </div>

      <MidPrinter className="w-[400px] h-auto block" />

      <div
        id="lower-container"
        className={`relative top-[-1px] h-[300px] overflow-hidden`}
      >
        <LowerPrinter className="w-[400px] h-auto" />
        <CSSTransition
          classNames={"Transcript"}
          in={!temp}
          unmountOnExit
          timeout={animationTimeOut}
          onEntered={(node) => {
            let lowerContainer = document.getElementById("lower-container");
            let offsetTop = lowerContainer.offsetTop;

            setIsPrinted(true);
            setTopD(`top-[${offsetTop}px]`);
          }}
        >
          <Modal showModal={isPrinted} parent={reviewPage}>
            <div
              className={`w-[240px] h-[240px] absolute ${topD} border-solid  border-black border bg-white ml-auto mr-auto left-0 right-0`}
            >
              {score}
            </div>
          </Modal>
        </CSSTransition>
      </div>

      <button
        onClick={() => {
          setTemp(!temp);
        }}
        className="absolute"
      >
        {temp ? "true" : "false"}
      </button>
    </div>
  );
}

export default Summary;
