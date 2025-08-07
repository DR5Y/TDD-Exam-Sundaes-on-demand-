import { createContext, useContext, useState, ReactNode } from "react";
import { pricePerItem } from "../constants";

//define types for our data structures
interface OptionCounts {
    scoops: Record<string, number>;// examples: (chocolate: 1, vanilla: 2)
    toppings: Record<string, number>;
}

interface Totals {
    scoops: number;
    toppings: number;
}

type OptionType = keyof OptionCounts;

interface OrderDetailsContextValue {
    optionCounts: OptionCounts;
    totals: Totals;
    updateItemCount: (itemName: string, newItemCount: number, optionType: OptionType) => void;
    resetOrder: () => void;
}

const OrderDetails = createContext<OrderDetailsContextValue | undefined>(undefined);

// create custom hook to check whether we're in a provider
export function useOrderDetails() {
  const contextValue = useContext(OrderDetails);

  if (!contextValue) {
    throw new Error(
      "useOrderDetails must be called from within an OrderDetailsProvider"
    );
  }

  return contextValue;
}

//props interface for the provider
interface OrderDetailsProviderProps {
    children: ReactNode;
}

export function OrderDetailsProvider({ children }: OrderDetailsProviderProps) {
  const [optionCounts, setOptionCounts] = useState<OptionCounts>({
    scoops: {}, // example: { Chocolate: 1, Vanilla: 2 }
    toppings: {}, // example: { "Gummi Bears": 1 }
  });

  function updateItemCount(itemName, newItemCount, optionType) {
    // make a copy of existing state
    const newOptionCounts = { ...optionCounts };

    // update the copy with the new information
    newOptionCounts[optionType][itemName] = newItemCount;

    // update the state with the updated copy
    setOptionCounts(newOptionCounts);

    // alternate way using function argument to setOptionCounts
    // see https://www.udemy.com/course/react-testing-library/learn/#questions/18721990/
    // setOptionCounts((previousOptionCounts) => ({
    //   ...previousOptionCounts,
    //   [optionType]: {
    //     ...previousOptionCounts[optionType],
    //     [itemName]: newItemCount,
    //   },
    // }));
  }

  function resetOrder(): void {
    setOptionCounts({ scoops: {}, toppings: {} });
  }

  // utility function to derive totals from optionCounts state value
  function calculateTotal(optionType: OptionType): number {
    // get an array of counts for the option type (for example, [1, 2])
    const countsArray = Object.values(optionCounts[optionType]) as number[];

    // total the values in the array of counts for the number of items
    const totalCount = countsArray.reduce((total, value) => total + value, 0);

    // multiply the total number of items by the price for this item type
    return totalCount * pricePerItem[optionType];
  }

  const totals = {
    scoops: calculateTotal("scoops"),
    toppings: calculateTotal("toppings"),
  };

  const value = { optionCounts, totals, updateItemCount, resetOrder };
  return <OrderDetails.Provider value={value}>{children}</OrderDetails.Provider>;
}
