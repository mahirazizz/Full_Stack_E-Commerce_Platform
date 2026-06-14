import {
  FileIcon,
  UploadCloudIcon,
  XIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/apiBaseUrl";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";

function ProductImageUpload({
  imageFile,
  setImageFile,
  uploadedImages,
  setUploadedImages,
  uploadedImageUrl,
  setUploadedImageUrl,
  imageLoadingState,
  setImageLoadingState,
  formData,
  setFormData,
}) {
  const inputRef = useRef(null);

  // Detect mode: single image (feature banner) or multiple images (products)
  const isSingleMode = uploadedImageUrl !== undefined;

  const currentImages =
    isSingleMode && uploadedImageUrl
      ? [uploadedImageUrl]
      : uploadedImages || [];

  function handleImageFileChange(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      setImageFile(selectedFiles);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      setImageFile(droppedFiles);
    }
  }

  function handleRemoveImage(imageToRemove) {
    if (isSingleMode) {
      setUploadedImageUrl("");
    } else {
      const updatedImages = uploadedImages.filter(
        (currentImage) => currentImage !== imageToRemove,
      );

      setUploadedImages(updatedImages);
      setFormData({
        ...formData,
        images: updatedImages,
        image: updatedImages[0] || null,
      });
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleMoveImageUp(index) {
    if (index === 0) return;

    const updatedImages = [...uploadedImages];
    [updatedImages[index - 1], updatedImages[index]] = [
      updatedImages[index],
      updatedImages[index - 1],
    ];

    setUploadedImages(updatedImages);
    setFormData({
      ...formData,
      images: updatedImages,
      image: updatedImages[0] || null,
    });
  }

  function handleMoveImageDown(index) {
    if (index === uploadedImages.length - 1) return;

    const updatedImages = [...uploadedImages];
    [updatedImages[index], updatedImages[index + 1]] = [
      updatedImages[index + 1],
      updatedImages[index],
    ];

    setUploadedImages(updatedImages);
    setFormData({
      ...formData,
      images: updatedImages,
      image: updatedImages[0] || null,
    });
  }

  async function uploadImageToCloudinary(filesToUpload) {
    if (!filesToUpload || filesToUpload.length === 0) return;

    setImageLoadingState(true);

    try {
      const uploadedUrls = [];

      for (const file of filesToUpload) {
        const data = new FormData();
        data.append("my_file", file);

        const response = await axios.post(
          `${API_BASE_URL}/api/admin/products/upload-image`,
          data,
        );

        if (response?.data?.success && response?.data?.result?.url) {
          uploadedUrls.push(response.data.result.url);
        }
      }

      if (uploadedUrls.length > 0) {
        if (isSingleMode) {
          // For single image mode (feature banner)
          setUploadedImageUrl(uploadedUrls[0]);
        } else {
          // For multiple images mode (products)
          const nextImages = [...uploadedImages, ...uploadedUrls];
          setUploadedImages(nextImages);
          setFormData({
            ...formData,
            images: nextImages,
            image: nextImages[0] || null,
          });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setImageLoadingState(false);
      setImageFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      uploadImageToCloudinary(imageFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile]);

  return (
    <div className="mx-auto mt-2 w-full max-w-md rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-4">
      <Label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        {isSingleMode ? "Upload Banner" : "Upload Images"}
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white p-4 shadow-sm"
      >
        <Input
          id="image-upload"
          type="file"
          multiple={!isSingleMode}
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
        />

        {!currentImages || currentImages.length === 0 ? (
          <Label
            htmlFor="image-upload"
            className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-[1rem] text-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/15">
              <UploadCloudIcon className="h-7 w-7" />
            </span>
            <span className="text-sm font-medium text-slate-700">
              Drag and drop or click to upload {isSingleMode ? "banner image" : "multiple images"}
            </span>
          </Label>
        ) : null}

        {imageLoadingState ? (
          <Skeleton className="mt-4 h-14 rounded-[1rem] bg-slate-200" />
        ) : null}

        {currentImages && currentImages.length > 0 ? (
          isSingleMode ? (
            // Single image mode - for feature banner
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white">
                  <FileIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Banner image
                  </p>
                  <p className="text-xs text-slate-500">
                    Ready to publish
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img
                  src={currentImages[0]}
                  alt="Banner"
                  className="h-40 w-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                onClick={() => handleRemoveImage(currentImages[0])}
              >
                <XIcon className="h-4 w-4 mr-2" />
                Remove and upload new
              </Button>
            </div>
          ) : (
            // Multiple image mode - for products
            <div className="mt-4 space-y-4 rounded-[1rem] border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white">
                  <FileIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Uploaded images
                  </p>
                  <p className="text-xs text-slate-500">
                    The first image is used as the product cover
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {currentImages.map((imageUrl, index) => (
                  <div
                    key={imageUrl}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2"
                  >
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-[10px] font-bold text-white">
                            COVER
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-950">
                        Position {index + 1}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {index === 0 ? "Shown first to user" : "Secondary image"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleMoveImageUp(index)}
                        disabled={index === 0}
                        title="Move image up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-lg text-slate-500 hover:bg-sky-50 hover:text-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleMoveImageDown(index)}
                        disabled={index === currentImages.length - 1}
                        title="Move image down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 flex-shrink-0 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => handleRemoveImage(imageUrl)}
                      title="Remove image"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Label
                htmlFor="image-upload"
                className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
              >
                Add more images
              </Label>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}

export default ProductImageUpload;
