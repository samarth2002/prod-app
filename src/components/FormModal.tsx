import React from 'react'
import { CircleX } from 'lucide-react';

type Props = {
    title: string,
    subtitle?: string,
    onFormSubmit?: (e: React.FormEvent) => void,
    closeFormModal?: () => void,
    children: React.ReactNode,
    formKey?: any
}

function FormModal({
  title,
  subtitle,
  onFormSubmit,
  closeFormModal,
  children,
}: Props) {
  return (
    <div className="absolute inset-0 flex items-start pt-25 justify-center bg-black/70 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-200 text-center max-h-[80vh] overflow-y-auto">
        <CircleX
          className="absolute top-5 right-5 hover:opacity-50"
          color="gray"
          onClick={closeFormModal}
        />
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-gray-600 mt-2">{subtitle}</p>
        <form
          onSubmit={onFormSubmit}
          className="flex flex-col justify-center p-6 gap-12"
        >
          {children}
        </form>
      </div>
    </div>
  );
}

export default FormModal