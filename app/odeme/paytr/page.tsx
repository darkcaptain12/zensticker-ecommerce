"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import PayTRClientPage from "./PaytrClientPage";

export default function PayTRPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-16 text-center">
          <p>Ödeme sayfası yükleniyor...</p>
        </div>
      }
    >
      <PayTRClientPage />
    </Suspense>
  );
}
