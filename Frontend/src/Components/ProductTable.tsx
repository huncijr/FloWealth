import {
  Button,
  FieldError,
  Input,
  InputGroup,
  ScrollShadow,
  TextField,
} from "@heroui/react";
import useDarkMode from "./Mode";
import { Diff, DollarSign, Minus, PencilLine } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

// Interface for a single product row
interface ProductRow {
  id: number;
  productName: string;
  quantity: string | number;
  estPrice: string | number | null;
}

// Props interface for the ProductTable component
interface ProductTableProps {
  rows: ProductRow[];
  setRows: Dispatch<SetStateAction<ProductRow[]>>;
}
const ProductTable: React.FC<ProductTableProps> = ({ rows, setRows }) => {
  const { isDark } = useDarkMode();

  // Adds a new empty row to the table with default values
  // Uses Date.now() for unique ID
  const AddNewRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), productName: "", quantity: 1, estPrice: null },
    ]);
  };

  // Removes a row by ID, but prevents deletion if only one row remains
  const RemoveRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // Handles input changes for any field in a row
  // For productName: keeps as string
  // For quantity/estPrice: converts to Number, or null if empty
  const handleInputChange = (id: number, field: string, value: string) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const newValue =
            field === "productName"
              ? value
              : value === ""
                ? null
                : Number(value);
          return { ...row, [field]: newValue };
        }
        return row;
      }),
    );
  };
  return (
    <div className="w-full overflow-x-auto rounded-xl py-10 px-2 border border-divider">
      <ScrollShadow className="max-h-[150px] sm:max-h-[200px] md:max-h-[250px] lg:max-h-[300px]  w-full">
        <table className="w-full min-w-[400px] text-sm border-collapse table-fixed ">
          <thead
            className={`${isDark ? "bg-black " : "bg-white"} uppercase font-semibold`}
          >
            <tr>
              <th className="w-[35%] text-sm sm:text-lg md:text-xl lg:text-2xl">
                Product
              </th>
              <th className="w-[25%]  text-sm sm:text-lg md:text-xl lg:text-2xl">
                Quantity
              </th>
              <th className="w-[25%]  text-sm sm:text-lg md:text-xl lg:text-2xl">
                Est Price
              </th>
              <th className="w-[15%]  text-sm sm:text-lg md:text-xl lg:text-2xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider min-w-[30%]">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="p-4">
                  <TextField
                    aria-label="Product name"
                    validate={(value) => {
                      if (value.trim() === null) {
                        return "";
                      }
                      return undefined;
                    }}
                  >
                    <Input
                      placeholder="Product Name"
                      value={row.productName}
                      onChange={(e) =>
                        handleInputChange(row.id, "productName", e.target.value)
                      }
                      className="min-w-0 w-full"
                    />
                    <FieldError className="text-danger text-sm" />
                  </TextField>
                </td>
                <td className="p-4">
                  <TextField
                    aria-label="Quantity"
                    validate={(value) => {
                      if (value.trim() === null) {
                        return "";
                      }
                      return undefined;
                    }}
                  >
                    <InputGroup>
                      <InputGroup.Prefix>
                        <PencilLine />
                      </InputGroup.Prefix>
                      <InputGroup.Input
                        placeholder="0"
                        type="Number"
                        maxLength={3}
                        value={row.quantity}
                        onChange={(e) =>
                          handleInputChange(row.id, "quantity", e.target.value)
                        }
                        className="min-w-0 w-full"
                      />
                    </InputGroup>
                    <FieldError className="text-danger text-sm" />
                  </TextField>
                </td>
                <td className="p-4">
                  <TextField
                    aria-label="Price"
                    validate={(value) => {
                      if (value.trim() === null) {
                        return "";
                      }
                      return undefined;
                    }}
                  >
                    <InputGroup>
                      <InputGroup.Prefix>
                        <DollarSign />
                      </InputGroup.Prefix>
                      <InputGroup.Input
                        placeholder="0"
                        type="Number"
                        value={row.estPrice ?? ""}
                        onChange={(e) =>
                          handleInputChange(row.id, "estPrice", e.target.value)
                        }
                        className="min-w-0 w-full"
                      />
                    </InputGroup>
                    <FieldError className="text-sm text-danger" />
                  </TextField>
                </td>
                <td>
                  <Button
                    variant="danger"
                    onClick={() => RemoveRow(row.id)}
                    isIconOnly
                    size="sm"
                  >
                    <Minus />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollShadow>
      <div className="p-4 flex justify-center sm:justify-start">
        <Button variant="outline" onClick={AddNewRow}>
          <Diff />
          Add new Product
        </Button>
      </div>
    </div>
  );
};

export default ProductTable;
