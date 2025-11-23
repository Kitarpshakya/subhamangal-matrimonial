import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { X, FileText, AlertCircle } from "lucide-react";

const Register = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="register-container"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <Card
        className="relative w-full max-w-2xl flex flex-col shadow-2xl"
        style={{ height: "90vh" }}
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            <h3 className="font-semibold text-lg" data-testid="register-title">
              Complete Registration Payment
            </h3>
          </div>
          <Button
            data-testid="close-register"
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Important Instructions
                </h4>
                <p className="text-yellow-800 text-sm">
                  Please ensure to include your{" "}
                  <strong>mobile number used in sign up</strong> in the
                  remark/note section of the payment. If you have already paid,
                  please wait for admin verification or contact admin.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h4
                className="text-xl font-bold mb-2"
                style={{ fontFamily: '"Playfair Display", serif' }}
              >
                Scan QR Code to Pay
              </h4>
              <p className="text-gray-600 mb-6">
                Complete your registration by making the payment
              </p>
            </div>

            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-rose-200">
                <img
                  src="/qr-code.png" // Replace with your actual QR code image path
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    e.target.src =
                      "https://via.placeholder.com/256x256?text=QR+Code";
                  }}
                />
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h5 className="font-semibold text-gray-900">Payment Details:</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Fee:</span>
                  <span className="font-semibold">NPR 1000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-semibold">
                    eSewa / Bank Transfer
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">
                How to Complete Payment:
              </h5>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Scan the QR code using your mobile banking app</li>
                <li>Enter the registration fee amount (NPR 1000)</li>
                <li>
                  <strong>Important:</strong> Add your registered mobile number in the
                  remark/note section
                </li>
                <li>Complete the payment</li>
                <li>Wait for admin verification (2-3 business days)</li>
              </ol>
            </div>

            {/* Contact Information */}
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h5 className="font-semibold text-rose-900 mb-2">Need Help?</h5>
              <p className="text-sm text-rose-800 mb-2">
                If you've already made the payment or need assistance, please
                contact:
              </p>
              <div className="text-sm text-rose-900 space-y-1">
                <p>
                  <strong>Email:</strong> support@shubhmangal.com
                </p>
                <p>
                  <strong>Phone:</strong> +977 98XXXXXXXX
                </p>
                <p>
                  <strong>WhatsApp:</strong> +977 98XXXXXXXX
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;
