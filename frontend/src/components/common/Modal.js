import React from "react";
import { createPortal } from "react-dom";

/**
 * Renders the children as a modal inside a specified element or as a normal wrapper.
 * @param {showModal} : A boolean indicates if to show the modal.
 * @param {parent} : The new parent that the modal is appending to.
 * @param {children} : The modal content.
 * @returns
 */
function Modal({ showModal, parent, children, ...props }) {
  return showModal ? createPortal(children, parent) : children;
}

export default Modal;
