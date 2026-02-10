"use client";

import { useState } from "react";
import Image from "next/image";

interface CoachAvatarProps {
  photoUrl: string | null;
  fullName: string;
  size: number;
  textSize?: string;
}

export default function CoachAvatar({ photoUrl, fullName, size, textSize = "text-xl" }: CoachAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const showImage = photoUrl && !imageError;

  return (
    <>
      {showImage ? (
        <Image
          src={photoUrl}
          alt={fullName}
          width={size}
          height={size}
          sizes={`${size}px`}
          className={`w-full h-full rounded-full object-cover`}
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`text-coral-500 ${textSize} font-bold`}>
          {fullName.charAt(0)}
        </span>
      )}
    </>
  );
}
