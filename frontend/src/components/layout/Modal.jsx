import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Stack } from "../../components";

const getModalSize = (size) => {
    switch (size) {
        case "sm": return "min-w-[300px] max-w-sm";
        case "md": return "min-w-[400px] max-w-md";
        case "lg": return "min-w-[500px] max-w-lg";
        case "xl": return "min-w-[600px] max-w-xl";
        case "full": return "min-w-[90vw] max-w-[90vw]";
        default: return "min-w-[340px] max-w-md";
    }
};

export function Modal({
    open = true,
    hideDialog,
    title,
    children,
    size = "default",
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = ""
}) {
  
    return (
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeOnOverlayClick ? hideDialog : undefined}>
          <TransitionChild
            as={Fragment}
            enter="transition-all ease-in-out duration-1000"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black opacity-75 transition-opacity" />
          </TransitionChild>
  
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center  text-center sm:items-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <DialogPanel className={`relative transform rounded-lg bg-white p-4 text-left shadow-xl transition-all ${getModalSize(size)} ${className}`}>
                    <div className="text-center sm:text-left">
                      <Stack horizontal className="justify-between mb-6 items-center">
                        <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                          {title}
                        </DialogTitle>
                        {showCloseButton && (
                          <button onClick={hideDialog} className="text-gray-400 hover:text-gray-600">
                            <i className="fa-solid fa-xmark fa-fw fa-sm" />
                          </button>
                        )}
                      </Stack>
                      <div className="mt-2">
                        {children}
                      </div>
                    </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }