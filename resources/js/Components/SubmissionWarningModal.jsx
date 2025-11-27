import React from 'react'
import { FiAlertTriangle, FiCheckCircle, FiX } from 'react-icons/fi'

export default function SubmissionWarningModal({ isOpen, onClose, onContinue }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-vicinity-card rounded-2xl shadow-2xl border border-vicinity-text/20 max-w-md w-full p-6" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-600/20 rounded-full flex items-center justify-center border border-yellow-500/30">
              <FiAlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-vicinity-text">Important Reminder</h3>
              <p className="text-sm text-vicinity-text/60">Before submitting your invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="text-vicinity-text/40 hover:text-vicinity-text p-1">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <FiAlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-medium mb-2">Supporting Documents Required</p>
              <p className="text-yellow-100 text-sm leading-relaxed">Please ensure that you have a service agreement, quotation, or talent release form to support your invoice. Invoices without any supporting documents will be rejected.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <p className="text-sm font-medium text-vicinity-text/80 mb-3">Required Documents:</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2"><FiCheckCircle className="w-4 h-4 text-green-400" /><span className="text-sm text-vicinity-text/70">Invoice Document</span></div>
            <div className="flex items-center space-x-2"><FiCheckCircle className="w-4 h-4 text-green-400" /><span className="text-sm text-vicinity-text/70">Service Agreement OR</span></div>
            <div className="flex items-center space-x-2"><FiCheckCircle className="w-4 h-4 text-green-400" /><span className="text-sm text-vicinity-text/70">Quotation OR</span></div>
            <div className="flex items-center space-x-2"><FiCheckCircle className="w-4 h-4 text-green-400" /><span className="text-sm text-vicinity-text/70">Talent Release Form</span></div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border border-vicinity-text/20 rounded-lg text-vicinity-text font-medium hover:bg-vicinity-input/20">Cancel</button>
          <button onClick={()=>{onClose(); onContinue();}} className="flex-1 bg-vicinity-text text-vicinity-bg py-3 px-4 rounded-lg font-bold hover:bg-white">I Understand, Continue</button>
        </div>
      </div>
    </div>
  )
}
