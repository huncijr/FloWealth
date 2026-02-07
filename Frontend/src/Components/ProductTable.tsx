import { Button, Input, ScrollShadow } from "@heroui/react";
import useDarkMode from "./Mode";
import { Diff, Minus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

interface ProductRow {
  id: number;
  productName: string;
  quantity: string | number;
  estPrice: string | number;
}
interface ProductTableProps {
  rows: ProductRow[];
  setRows: Dispatch<SetStateAction<ProductRow[]>>;
}
const ProductTable: React.FC<ProductTableProps> = ({ rows, setRows }) => {
  const { isDark } = useDarkMode();

  const AddNewRow = () => {
    setRows([
      ...rows,
      { id: Date.now(), productName: "", quantity: 0, estPrice: 0 },
    ]);
  };
  const RemoveRow = (id: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };
  const handleInputChange = (id: number, field: string, value: string) => {
    const updatedRows = rows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row,
    );
    setRows(updatedRows);
  };
  return (
    <div className="w-full overflow-x-auto rounded-xl py-10 px-2 border border-divider">
      <ScrollShadow className="max-h-[300px] w-full">
        <table className="w-full text-sm border-collapse ">
          <thead
            className={`${isDark ? "bg-black " : "bg-white"} uppercase font-semibold`}
          >
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Est Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-divider">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="p-4">
                  <Input
                    placeholder="Product Name"
                    value={row.productName}
                    onChange={(e) =>
                      handleInputChange(row.id, "productName", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className="p-4">
                  <Input
                    placeholder="0"
                    type="Number"
                    value={row.quantity}
                    maxLength={3}
                    onChange={(e) =>
                      handleInputChange(row.id, "quantity", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td className="p-4">
                  <Input
                    placeholder="0"
                    type="Number"
                    value={row.estPrice}
                    onChange={(e) =>
                      handleInputChange(row.id, "estPrice", e.target.value)
                    }
                    className="w-full"
                  />
                </td>
                <td>
                  <Button variant="danger" onClick={() => RemoveRow(row.id)}>
                    <Minus />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollShadow>
      <div className="p-4">
        <Button variant="outline" onClick={AddNewRow}>
          <Diff />
          Add new Product
        </Button>
      </div>
    </div>
  );
};

export default ProductTable;
