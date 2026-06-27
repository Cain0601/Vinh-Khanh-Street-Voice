import React from "react";
import OwnerPoiDetailClient from "./OwnerPoiDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: Props) {
  // Giải nén params dạng Promise bằng React.use()
  const unwrappedParams = React.use(params);

  return <OwnerPoiDetailClient poiId={unwrappedParams.id} />;
}