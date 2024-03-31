"use client";
import { trpc } from "@/app/_trpc/client";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";

interface ChatWrapperProps {
  fileId: string;
}

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    {
      fileId,
    },
    {
      refetchInterval: (query) =>
        query.state.data?.status === "SUCCESS" ||
        query.state.data?.status === "FAILED"
          ? false
          : 500,
    }
  );

  if (isLoading)
    return (
      <div className="relative min-h-full bg-slate-50 flex divide-slate-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <h3 className="font-semibold text-x1">Loading...</h3>
            <p className="text-slate-500 text-sm">
              We&apos;re preparing your PDF
            </p>
          </div>
        </div>
        <ChatInput />
      </div>
    );

  if (data?.status === "PROCESSING")
    return (
      <div className="relative min-h-full bg-slate-50 flex divide-slate-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            <h3 className="font-semibold text-x1">Processing...</h3>
            <p className="text-slate-500 text-sm">This wn&apos;t take long.</p>
          </div>
        </div>
        <ChatInput isDisabled />
      </div>
    );

  if (data?.status === "FAILED")
    return (
      <div className="relative min-h-full bg-slate-50 flex divide-slate-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-1">
            <XCircle className="h-8 w-8 text-red-500 " />
            <h3 className="font-semibold text-x1">Too many pages in PDF</h3>
            <p className="text-slate-500 text-sm">
              Your <span className="font-medium">Free</span>Plan supports up to
              5 pages per PDF
            </p>
            <Link
              href={"/dashboard"}
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          </div>
        </div>

        <ChatInput isDisabled />
      </div>
    );
  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-slate-50 flex divide-y divide-slate-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId={fileId} />
        </div>
        <ChatInput />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
