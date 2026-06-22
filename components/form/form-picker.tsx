"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import { CheckIcon, Loader2Icon } from "lucide-react";

import { defaultImages } from "@/constants/images";
import { unsplash } from "@/lib/unsplash";
import { cn } from "@/lib/utils";

import { FormErrors } from "./form-errors";

/** Represents a subset of the Unsplash API image response */
interface UnsplashImage {
  id: string;
  urls: {
    thumb: string;
    full: string;
    [key: string]: string;
  };
  links: {
    html: string;
    [key: string]: string;
  };
  user: {
    name: string;
    [key: string]: unknown;
  };
}

/** Props for the FormPicker component */
interface FormPickerProps {
  /** The unique identifier used for the radio input name and id attributes */
  id: string;
  /** Validation errors to display below the image grid */
  errors?: Record<string, string[] | undefined>;
}

/**
 * A form component that displays a grid of random Unsplash images for selection.
 * Falls back to default images if the Unsplash API request fails.
 * The selected image data is encoded as a pipe-separated string in the radio input value.
 */
export const FormPicker = ({ id, errors }: FormPickerProps) => {
  // Tracks parent form submission state to disable interactions while pending
  const { pending } = useFormStatus();

  const [images, setImages] = useState<Array<UnsplashImage>>(defaultImages);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  /** Fetches 9 random images from the Unsplash nature collection on mount */
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await unsplash.GET("/photos/random", {
          params: {
            query: {
              collections: ["317099"],
              count: 9,
            },
          },
        });

        if (data && !error) {
          const newImages = (
            Array.isArray(data) ? data : [data]
          ) as Array<UnsplashImage>;
          setImages(newImages);
        } else {
          console.error("Failed to get images from Unsplash");
        }
      } catch (error) {
        // Use default images as fallback if the API request fails
        console.log(error);
        setImages(defaultImages);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2Icon className="size-6 animate-spin text-sky-700" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-2 grid grid-cols-3 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className={cn(
              "group bg-muted relative aspect-video cursor-pointer transition hover:opacity-75",
              // Disable hover effects and pointer when form is submitting
              pending && "cursor-auto opacity-50 hover:opacity-50",
            )}
            onClick={() => {
              if (pending) return;
              setSelectedImageId(image.id);
            }}
          >
            {/*
             * Hidden radio input that stores the selected image data.
             * Value format: "id|thumbUrl|fullUrl|htmlLink|authorName"
             */}
            <input
              checked={selectedImageId === image.id}
              className="hidden"
              disabled={pending}
              id={id}
              name={id}
              readOnly
              type="radio"
              value={`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.links.html}|${image.user.name}`}
            />
            <Image
              alt="Unsplash image"
              className="rounded-sm object-cover"
              fill
              src={image.urls.thumb}
            />
            {/* Selection indicator overlay */}
            {selectedImageId === image.id && (
              <div className="absolute inset-y-0 flex size-full items-center justify-center bg-black/30">
                <CheckIcon className="size-4 text-white" />
              </div>
            )}
            {/* Attribution link, visible on hover per Unsplash guidelines */}
            <Link
              className="absolute bottom-0 w-full truncate bg-black/50 p-1 text-[10px] text-white opacity-0 group-hover:opacity-100 hover:underline"
              href={image.links.html}
              target="_blank"
            >
              {image.user.name}
            </Link>
          </div>
        ))}
      </div>
      <FormErrors errors={errors} id="image" />
    </div>
  );
};
