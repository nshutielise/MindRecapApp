import React from 'react';
import { Check, X, CreditCard, Zap } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSubscribe }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                <Zap className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Upgrade to Pro
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    You've reached your free limit. Upgrade to MindRecap Pro for unlimited recordings and advanced features.
                  </p>
                  
                  <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex justify-between items-baseline">
                      <span className="text-3xl font-extrabold text-gray-900">$5</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Cancel anytime. No hidden fees.</p>

                    <ul className="mt-4 space-y-3">
                      <li className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Unlimited recordings
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Advanced AI summaries
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Priority support
                      </li>
                      <li className="flex items-center text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Export to PDF & Markdown
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onSubscribe}
            >
              Subscribe Now
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
