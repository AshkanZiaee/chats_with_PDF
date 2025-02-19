"use client"

import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  RotateCw,
  Search,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { useResizeDetector } from "react-resize-detector"
import { z } from "zod"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Input } from "./ui/input"
import { useToast } from "./ui/use-toast"
import SimpleBar from "simplebar-react"
import PdfFullscreen from "./PdfFullscreen"

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast()
  const { width, ref } = useResizeDetector()
  const [currPage, setCurrPage] = useState<number>(1)
  const [numPages, setNumPages] = useState<number>()
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)
  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale ? true : false
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  })

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  })
  function handlePageSubmit({ page }: TCustomPageValidator) {
    setCurrPage(Number(page))
    setValue("page", String(page))
  }

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-slate-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5 mt-2">
          <Button
            disabled={currPage === numPages || numPages === undefined}
            aria-label="previous-page"
            variant="ghost"
            onClick={() => {
              // @ts-ignore
              setCurrPage((prev) =>
                prev + 1 > numPages! ? numPages! : prev + 1
              )
              setValue("page", String(currPage + 1))
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)()
                }
              }}
            />
            <p className="text-slate-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            disabled={currPage <= 1}
            aria-label="next-page"
            variant="ghost"
            onClick={() => {
              setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))
              setValue("page", String(currPage - 1))
            }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                %100
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                %150
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                %200
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                %250
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button aria-label="rotate 90 degrees" variant="ghost">
            <RotateCw
              className="h-4 w-4"
              onClick={() => {
                setRotation((prev) => prev + 90)
              }}
            />
          </Button>
          <PdfFullscreen url={url} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: "Error Loading Pdf",
                  description: "Please try again later",
                  variant: "destructive",
                })
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={url}
              className="max=h-full"
            >
              <Page
                width={width ? width : 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + renderedScale}
              />
              {/* <Page
                className={cn(isLoading ? "hidden" : "")}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@" + scale}
                loading={
                  <div className="flex justify-center ">
                    <Loader2 className="my-24 h-6 w-6 animate-spin" />
                  </div>
                }
                width={width ? width : 1}
                onRenderSuccess={() => setRenderedScale(scale)}
              /> */}
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default PdfRenderer
