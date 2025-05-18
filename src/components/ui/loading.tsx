"use client";

import { useLinkStatus } from "next/link";
import { FaSpinner } from "react-icons/fa";

export function LoadingSpinner() {
  const { pending } = useLinkStatus();
  return pending ? (
    <div className="flex justify-center items-center">
      <FaSpinner className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
    </div>
  ) : null;
}
