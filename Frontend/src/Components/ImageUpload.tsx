import { Button, Input, Label } from "@heroui/react";
import { Plus, SquareCheckBig, Trash, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
import FloWealthReceipt from "../assets/flowealthtoreceipt.png";
import html2canvas from "html2canvas";
interface ImageUploadProps {
  onImageSelect: (base64String: string | null) => void;
  initialImage?: string | null | undefined;
}
interface ReceiptItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

const ImageUpload = ({ onImageSelect, initialImage }: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isreceiptmodalopen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] =
    useState<boolean>(false);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([
    { id: Date.now(), name: "", quantity: 1, price: 0 },
  ]);
  const [storeName, setStoreName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [receiptdate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageSelect(base64String);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateReceiptItem = (
    id: number,
    field: string,
    value: number | string,
  ) => {
    setReceiptItems(
      receiptItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeReceiptItem = (id: number) => {
    if (receiptItems.length > 1) {
      setReceiptItems(receiptItems.filter((item) => item.id !== id));
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageSelect(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveReceipt = async () => {
    if (receiptRef.current) {
      try {
        const canvas = await html2canvas(receiptRef.current, {
          backgroundColor: "#ffffff",
          scale: 3,
          onclone: (doc) => {
            const root = doc.querySelector<HTMLElement>("[data-receipt-root]");
            if (!root) return;

            const style = doc.createElement("style");
            style.textContent = `[data-receipt-root], [data-receipt-root] * {color: #000 !important;background: transparent 
            !important;background-color: transparent !important;border-color: #e5e7eb !important;outline-color: #e5e7eb !important;
            box-shadow: none !important; text-shadow: none !important; filter: none !important; line-height: 2 !important;  
      }
    [data-receipt-root] {
        background-color: #fff !important;
      }
    `;
            doc.head.appendChild(style);

            root.style.backgroundColor = "#fff";
            root.style.color = "#000";
            root.style.borderColor = "#e5e7eb";
          },
        });
        const base64 = canvas.toDataURL("image/png");
        setPreview(base64);
        onImageSelect(base64);
        setIsReceiptModalOpen(false);
        setReceiptItems([{ id: Date.now(), name: "", quantity: 1, price: 0 }]);
      } catch (error) {
        console.error("Error capturing receipt", error);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2 md:gap-4 lg:gap-6 xl:gap-8 items-stretch rounded-2xl  ">
        <div className="flex-1 min-h-[200px] bg-gray-200 dark:bg-gray-700 rounded-xl p-6 flex items-center justify-center">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {!preview ? (
            <div
              className={`flex flex-col items-center gap-4 cursor-pointer group w-full ${isDragging ? " border-3 border-dashed border-primary rounded-2xl" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              onClick={handleClick}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-[20px] rounded-full" />
                <div
                  className="relative w-20 h-20 rounded-full border-2 border-dashed border-warm-brown/30 
                                flex items-center justify-center
                                bg-warm-white/80 dark:bg-warm-dark/80
                                group-hover:border-primary/50 group-hover:bg-primary/5
                                transition-all duration-300 hover:scale-105"
                >
                  <Upload
                    size={32}
                    className="text-primaru group-hover:text-primary transition-colors"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-warm-dark dark:text-warm-light group-hover:text-primary transition-colors">
                  Upload receipt
                </p>
                <p className="text-xs "> Drag & drop or click to browse</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div className="relative rounded-lg overflow-hidden border ">
                <img
                  src={preview}
                  alt="Your Image"
                  className="w-full h-48 object-cover"
                />
                <div
                  className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-200 flex
                items-center justify-center opacity-0 hover:opacity-100"
                >
                  <button
                    onClick={handleRemove}
                    className="cursor-pointer p-3 rounded-full bg-red-500/90 text-white hover:bg-red-600 transition-colors shadow-lg transform hover:scale-110"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-emerald-500/90 rounded-xl p-1">
                <SquareCheckBig />{" "}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 rounded-lg min-h-[200px] p-6 flex items-center justify-center  group bg-gray-200 dark:bg-gray-700 transition-colors duration-200">
          <div
            className="flex flex-col items-center gap-4 cursor-pointer"
            onClick={() => {
              setStoreName("");
              setReceiptItems([
                { id: Date.now(), name: "", quantity: 1, price: 0 },
              ]);
              setReceiptDate(new Date().toISOString().split("T")[0]);
              setIsReceiptModalOpen(true);
            }}
          >
            <div className="relative ">
              <div className="absolute inset-0 bg-emerald-500/15 blur-[15px] rounded-full" />
              <div
                className="relative w-16 h-16 rounded-xl bg-warm-brown/10dark:bg-warm-light/10
                              flex items-center justify-center
                              group-hover:bg-emerald-500/20 group-hover:scale-105
                              transition-all duration-300 "
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="text-warm-brown/70 dark:text-warm-light/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                >
                  <rect
                    x="6"
                    y="2"
                    width="20"
                    height="28"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                  />{" "}
                  <path
                    d="M6 5 L8 3 L10 5 L12 3 L14 5 L16 3 L18 5 L20 3 L22 5 L24 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Lines on receipt */}
                  <line
                    x1="10"
                    y1="10"
                    x2="22"
                    y2="10"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="10"
                    y1="14"
                    x2="22"
                    y2="14"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <line
                    x1="10"
                    y1="18"
                    x2="18"
                    y2="18"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  {/* Dollar sign */}
                  <circle
                    cx="22"
                    cy="22"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="none"
                  />
                  <text
                    x="22"
                    y="25"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="6"
                    fontWeight="bold"
                  >
                    $
                  </text>
                </svg>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-warm-dark dark:text-warm-light group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Create own receipt
              </p>
              <p className="text-xs text-warm-brown/50 dark:text-warm-light/40 mt-1">
                Design a custom receipt
              </p>
            </div>
          </div>
        </div>
      </div>
      {isreceiptmodalopen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-6">
          {/* SHEET */}
          <div
            className="
        w-full max-w-[1100px] max-h-[90vh]
        rounded-2xl overflow-hidden
        bg-white/95 dark:bg-zinc-900/90
        border border-black/10 dark:border-white/10
        shadow-2xl
      "
          >
            {/* HEADER / TOOLBAR */}
            <div
              className="
          flex items-center justify-between
          px-4 py-3
          bg-black/[0.03] dark:bg-white/[0.04]
          border-b border-black/10 dark:border-white/10
        "
            >
              <div className="flex flex-col">
                <h2 className="text-base font-semibold text-warm-dark dark:text-warm-light">
                  Create Receipt
                </h2>
                <p className="text-xs text-black/50 dark:text-white/50">
                  Fill in fields, add items, then save.
                </p>
              </div>

              <Button
                variant="tertiary"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                <X className="text-warm-dark dark:text-warm-light" size={20} />
              </Button>
            </div>

            {/* BODY (scrollable) */}
            <div className="max-h-[calc(90vh-56px)] overflow-y-auto">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6">
                {/* LEFT: FORM */}
                <div className="flex-1 space-y-5">
                  {/* Store + Date */}
                  <div
                    className="
                rounded-2xl p-4
                bg-black/[0.02] dark:bg-white/[0.03]
                border border-black/10 dark:border-white/10
              "
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-1">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                          Store name
                        </Label>
                        <Input
                          className="w-full"
                          placeholder="Enter a store name"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-1">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                          Date
                        </Label>
                        <input
                          type="date"
                          value={receiptdate}
                          onChange={(e) => setReceiptDate(e.target.value)}
                          className="
                      h-9 w-fit px-3 text-sm rounded-xl
                      bg-white dark:bg-zinc-950
                      border border-black/10 dark:border-white/10
                      text-warm-dark dark:text-warm-light
                      outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10
                    "
                        />
                      </div>
                    </div>
                  </div>

                  {/* Items (Editor table) */}
                  <div
                    className="
                rounded-2xl p-4
                bg-black/[0.02] dark:bg-white/[0.03]
                border border-black/10 dark:border-white/10
              "
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                        Items
                      </Label>

                      <Button
                        variant="ghost"
                        onClick={() =>
                          setReceiptItems([
                            ...receiptItems,
                            { id: Date.now(), name: "", quantity: 1, price: 0 },
                          ])
                        }
                        className="border-dashed"
                      >
                        <Plus />
                        Add item
                      </Button>
                    </div>

                    {/* table header */}
                    <div
                      className="
                  grid grid-cols-[1fr_72px_96px_40px]
                  gap-2 px-2 mb-2
                  text-[11px] font-semibold tracking-wide uppercase
                  text-black/50 dark:text-white/50
                "
                    >
                      <div>Item</div>
                      <div className="text-center">Qty</div>
                      <div className="text-right">Price</div>
                      <div />
                    </div>

                    {/* rows */}
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {receiptItems.map((item) => (
                        <div
                          key={item.id}
                          className="
                      grid grid-cols-[1fr_72px_96px_40px]
                      gap-2 p-2 rounded-xl
                      bg-white/70 dark:bg-zinc-950/40
                      border border-black/10 dark:border-white/10
                    "
                        >
                          <Input
                            className="w-full min-w-0"
                            type="text"
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) =>
                              updateReceiptItem(item.id, "name", e.target.value)
                            }
                          />

                          <Input
                            className="w-full text-center"
                            type="text"
                            inputMode="numeric"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateReceiptItem(
                                item.id,
                                "quantity",
                                parseInt(e.target.value || "0", 10),
                              )
                            }
                          />

                          <Input
                            className="w-full text-right"
                            type="text"
                            inputMode="decimal"
                            placeholder="0.00"
                            value={item.price}
                            onChange={(e) =>
                              updateReceiptItem(
                                item.id,
                                "price",
                                parseFloat(e.target.value || "0"),
                              )
                            }
                          />

                          <Button
                            variant="danger-soft"
                            onClick={() => removeReceiptItem(item.id)}
                            isDisabled={receiptItems.length === 1}
                            className="h-9 w-9 p-0"
                          >
                            <Trash />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT: PREVIEW */}
                <div className="flex-1 flex items-start justify-center">
                  <div className="w-full lg:max-w-[480px]">
                    <div
                      className="
                  rounded-2xl
                  bg-black/[0.02] dark:bg-white/[0.03]
                  border border-black/10 dark:border-white/10
                  p-4
                "
                    >
                      <div
                        className="cursor-zoom-in"
                        onClick={() => setIsReceiptPreviewOpen(true)}
                        title="Click to enlarge"
                      >
                        <div
                          ref={receiptRef}
                          data-receipt-root
                          className="bg-white rounded-xl shadow-lg overflow-hidden border border-black/10"
                          style={{
                            padding: "16px",
                            fontFamily: "'Courier New', monospace",
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            borderColor: "#e5e7eb",
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-sm font-bold text-black tracking-wider">
                              CASH RECEIPT
                            </h3>
                            <img
                              src={FloWealthReceipt}
                              className="w-[30%] object-contain"
                              alt="Receipt logo"
                            />
                          </div>

                          {storeName.trim() !== "" && (
                            <span className="text-black text-lg">
                              {storeName}
                            </span>
                          )}

                          <p className="text-xs mb-2 text-black">
                            {receiptdate || "No date"}
                          </p>

                          <div className="border-t-2 border-dashed border-gray-400 mb-2" />

                          <div className="flex text-lg font-bold border-b border-gray-300 pb-1 mb-1">
                            <span className="flex-[.9] text-black">Item</span>
                            <span className="w-8 text-center mr-2 text-black">
                              Qty
                            </span>
                            <span className="w-12 text-right text-black">
                              Price
                            </span>
                          </div>

                          <div className="space-y-0.5 mb-2">
                            {receiptItems
                              .filter((i) => i.name.trim() !== "")
                              .map((item) => (
                                <div
                                  key={item.id}
                                  className="flex text-lg font-medium text-black p-1  leading-tight"
                                >
                                  <span className="flex-[.9] truncate leading-tight">
                                    {item.name}
                                  </span>
                                  <span className="w-8 text-center leading-tight">
                                    {item.quantity}
                                  </span>
                                  <span className="w-12 text-right leading-tight">
                                    $
                                    {(
                                      Number(item.price) * Number(item.quantity)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}

                            {receiptItems.filter((i) => i.name.trim() === "")
                              .length === receiptItems.length && (
                              <p className="text-lg text-gray-400 italic">
                                No items
                              </p>
                            )}
                          </div>

                          <div className="border-t-2 border-dashed border-gray-400 mb-2" />

                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-black text-xl">TOTAL</span>
                            <span className="text-emerald-600 text-xl">
                              $
                              {receiptItems
                                .reduce(
                                  (acc, i) =>
                                    acc + Number(i.price) * Number(i.quantity),
                                  0,
                                )
                                .toFixed(2)}
                            </span>
                          </div>

                          <div className="border-t-2 border-dashed border-gray-400 mt-2" />
                          <p className="text-center text-lg text-gray-500 mt-2">
                            Thank you for shopping
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* STICKY ACTION BAR */}
                    <div
                      className="
                  sticky bottom-0 mt-4
                  bg-white/90 dark:bg-zinc-900/80 backdrop-blur
                  
                  rounded-2xl
                  px-4 py-3
                  flex justify-end gap-3
                "
                    >
                      <Button
                        variant="danger-soft"
                        onClick={() => {
                          setReceiptItems([
                            { id: Date.now(), name: "", quantity: 1, price: 0 },
                          ]);
                          setReceiptDate(
                            new Date().toISOString().split("T")[0],
                          );
                          setStoreName("");
                        }}
                      >
                        Reset
                      </Button>
                      <Button onClick={handleSaveReceipt}>Save Receipt</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isReceiptPreviewOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60"
          onClick={() => setIsReceiptPreviewOpen(false)}
        >
          <div
            className="w-full max-w-[900px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <Button
                variant="tertiary"
                onClick={() => setIsReceiptPreviewOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl border border-black/10 p-4">
              <div
                className="bg-white rounded-xl overflow-hidden"
                style={{
                  padding: "20px",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                <div className="w-full h-full">
                  <div
                    className="
                  rounded-2xl
                  bg-black/[0.02] dark:bg-white/[0.03]
                  border border-black/10 dark:border-white/10
                  p-4
                "
                  >
                    <div
                      className="cursor-zoom-in"
                      onClick={() => setIsReceiptPreviewOpen(true)}
                      title="Click to enlarge"
                    >
                      <div
                        className="bg-white rounded-xl shadow-lg overflow-hidden border border-black/10"
                        style={{
                          padding: "16px",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-sm font-bold text-black tracking-wider">
                            CASH RECEIPT
                          </h3>
                          <img
                            src={FloWealthReceipt}
                            className="w-[30%] object-contain"
                            alt="Receipt logo"
                          />
                        </div>

                        {storeName.trim() !== "" && (
                          <span className="text-black text-lg">
                            {storeName}
                          </span>
                        )}

                        <p className="text-xs mb-2 text-black">
                          {receiptdate || "No date"}
                        </p>

                        <div className="border-t-2 border-dashed border-gray-400 mb-2" />

                        <div className="flex text-lg font-bold border-b border-gray-300 pb-1 mb-1">
                          <span className="flex-[.9] text-black">Item</span>
                          <span className="w-8 text-center mr-2 text-black">
                            Qty
                          </span>
                          <span className="w-12 text-right text-black">
                            Price
                          </span>
                        </div>

                        <div className="space-y-0.5 mb-2">
                          {receiptItems
                            .filter((i) => i.name.trim() !== "")
                            .map((item) => (
                              <div
                                key={item.id}
                                className="flex text-lg font-medium text-black"
                              >
                                <span className="flex-[.9] truncate">
                                  {item.name}
                                </span>
                                <span className="w-8 text-center">
                                  {item.quantity}
                                </span>
                                <span className="w-12 text-right">
                                  $
                                  {(
                                    Number(item.price) * Number(item.quantity)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            ))}

                          {receiptItems.filter((i) => i.name.trim() === "")
                            .length === receiptItems.length && (
                            <p className="text-lg text-gray-400 italic">
                              No items
                            </p>
                          )}
                        </div>

                        <div className="border-t-2 border-dashed border-gray-400 mb-2" />

                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-black text-xl">TOTAL</span>
                          <span className="text-emerald-600 text-xl">
                            $
                            {receiptItems
                              .reduce(
                                (acc, i) =>
                                  acc + Number(i.price) * Number(i.quantity),
                                0,
                              )
                              .toFixed(2)}
                          </span>
                        </div>

                        <div className="border-t-2 border-dashed border-gray-400 mt-2" />
                        <p className="text-center text-lg text-gray-500 mt-2">
                          Thank you for shopping
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
