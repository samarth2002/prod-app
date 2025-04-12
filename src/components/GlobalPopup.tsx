import React from "react";

type Props = {
  children: React.ReactNode;
};

function GlobalPopup({ children }: Props) {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/70">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        {children}
      </div>
    </div>
  );
}

export default GlobalPopup;
