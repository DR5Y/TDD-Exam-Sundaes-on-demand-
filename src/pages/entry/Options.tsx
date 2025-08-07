import axios, { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import Row from "react-bootstrap/Row";
import ScoopOption from "./ScoopOption";
import ToppingOption from "./ToppingOption";
import AlertBanner from "../common/AlertBanner";
import { pricePerItem } from "../../constants";
import { formatCurrency } from "../../utilities";
import { useOrderDetails } from "../../contexts/OrderDetails";

//define the option type
type OptionType = "scoops" | "toppings";

interface OptionItem {
  name: string;
  imagePath: string;
}

//define the props interface
interface OptionProps {
  optionType: OptionType;
}

export default function Options({ optionType }: OptionProps) {
  const [items, setItems] = useState<OptionItem[]>([]);
  const [error, setError] = useState<boolean>(false);
  const { totals } = useOrderDetails();

  // optionType is 'scoops' or 'toppings
  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`http://localhost:3030/${optionType}`, { signal: controller.signal })
      .then((response: AxiosResponse<OptionItem[]>) => setItems(response.data))
      .catch((error: any) => {
        if (error.name !== "CanceledError") setError(true);
      });

    return () => controller.abort();
  }, [optionType]);

  if (error) {
    // @ts-ignore
    return <AlertBanner />;
  }

  const ItemComponent = optionType === "scoops" ? ScoopOption : ToppingOption;
  const title = optionType[0].toUpperCase() + optionType.slice(1).toLowerCase();

  const optionItems = items.map((item: OptionItem) => (
    <ItemComponent
      key={item.name}
      name={item.name}
      imagePath={item.imagePath}
    />
  ));

  return (
    <>
      <h2>{title}</h2>
      <p>{formatCurrency(pricePerItem[optionType])} each</p>
      <p>
        {title} total: {formatCurrency(totals[optionType])}
      </p>
      <Row>{optionItems}</Row>
    </>
  );
}
