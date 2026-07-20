import React from "react";
import { ShieldAlert } from "lucide-react";

export function BlockedScreen() {
  return (
    <div className="min-h-screen w-full bg-red-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-red-600">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Security Alert</h1>
        <p className="text-gray-600 mb-8 text-lg">
          You are loading too many pages too quickly. To prevent DDoS attacks, your access has been temporarily blocked for <strong>15 minutes</strong>.
        </p>
        <p className="text-sm text-gray-500">
          Please wait 15 minutes and then refresh this page to regain access.
        </p>
      </div>
    </div>
  );
}
