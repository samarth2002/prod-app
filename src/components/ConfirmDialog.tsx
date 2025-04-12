import React from "react";

type Props = {
  title: string;
  subtitle: string;
  onConfirm: () => void; 
  onCancel: () => void; 
};

function ConfirmDialog({ title, subtitle ,onConfirm, onCancel }: Props) {
  return (
    <div className="text-black fixed inset-0 flex justify-center items-center bg-black/70">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-gray-600 mt-2">{subtitle}</p>

        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
          >
            Yes, Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
