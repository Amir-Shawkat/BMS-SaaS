"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageIcon, Upload, X } from "lucide-react";
import { UploadSchema, type UploadFormSchema } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import LoadingOverlay from "@/components/LoadingOverlay";
import { DEFAULT_VOICE, voiceCategories, voiceOptions } from "@/lib/constants";

const UploadForm = () => {
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<UploadFormSchema>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      pdfFile: undefined,
      coverImage: undefined,
      title: "",
      author: "",
      voice: DEFAULT_VOICE.charAt(0).toUpperCase() + DEFAULT_VOICE.slice(1),
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: UploadFormSchema) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Placeholder until backend upload/synthesis action is connected.
    console.log("Book upload form submitted", values);
  };

  const voices = [
    { key: "dave", group: "male" as const },
    { key: "daniel", group: "male" as const },
    { key: "chris", group: "male" as const },
    { key: "rachel", group: "female" as const },
    { key: "sarah", group: "female" as const },
  ];

  return (
    <div className="new-book-wrapper">
      {form.formState.isSubmitting && <LoadingOverlay />}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="pdfFile"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Book PDF File</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <input
                      ref={pdfInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                    {field.value ? (
                      <div className="upload-dropzone upload-dropzone-uploaded border-2 border-dashed border-[#d4c9b7]">
                        <p className="upload-dropzone-text">{field.value.name}</p>
                        <button
                          type="button"
                          className="upload-dropzone-remove mt-2"
                          onClick={() => {
                            field.onChange(undefined);
                            if (pdfInputRef.current) {
                              pdfInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove selected PDF"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => pdfInputRef.current?.click()}
                        className="upload-dropzone w-full border-2 border-dashed border-[#d4c9b7]"
                      >
                        <Upload className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload PDF</p>
                        <p className="upload-dropzone-hint">PDF file (max 50MB)</p>
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                    {field.value ? (
                      <div className="upload-dropzone upload-dropzone-uploaded border-2 border-dashed border-[#d4c9b7]">
                        <p className="upload-dropzone-text">{field.value.name}</p>
                        <button
                          type="button"
                          className="upload-dropzone-remove mt-2"
                          onClick={() => {
                            field.onChange(undefined);
                            if (coverInputRef.current) {
                              coverInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove selected cover image"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="upload-dropzone w-full border-2 border-dashed border-[#d4c9b7]"
                      >
                        <ImageIcon className="upload-dropzone-icon" />
                        <p className="upload-dropzone-text">Click to upload cover image</p>
                        <p className="upload-dropzone-hint">Leave empty to auto-generate from PDF</p>
                      </button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Title</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="ex: Rich Dad Poor Dad"
                    className="form-input"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Author Name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="ex: Robert Kiyosaki"
                    className="form-input"
                    autoComplete="off"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="voice"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#555]">Male Voices</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {voices
                          .filter(({ key }) => voiceCategories.male.includes(key))
                          .map(({ key }) => {
                            const option = voiceOptions[key as keyof typeof voiceOptions];
                            const selected = field.value === option.name;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => field.onChange(option.name)}
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                              >
                                <span
                                  className={`size-4 rounded-full border ${
                                    selected
                                      ? "border-[#663820] bg-[#663820]"
                                      : "border-[#bfb6a7] bg-white"
                                  }`}
                                />
                                <span className="text-left">
                                  <p className="font-semibold text-[#222]">{option.name}</p>
                                  <p className="text-xs text-[#666]">{option.description}</p>
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#555]">Female Voices</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {voices
                          .filter(({ key }) => voiceCategories.female.includes(key))
                          .map(({ key }) => {
                            const option = voiceOptions[key as keyof typeof voiceOptions];
                            const selected = field.value === option.name;

                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => field.onChange(option.name)}
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                              >
                                <span
                                  className={`size-4 rounded-full border ${
                                    selected
                                      ? "border-[#663820] bg-[#663820]"
                                      : "border-[#bfb6a7] bg-white"
                                  }`}
                                />
                                <span className="text-left">
                                  <p className="font-semibold text-[#222]">{option.name}</p>
                                  <p className="text-xs text-[#666]">{option.description}</p>
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="form-btn" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Synthesizing..." : "Begin Synthesis"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default UploadForm;
