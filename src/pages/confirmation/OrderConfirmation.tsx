import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import Button from "react-bootstrap/Button";
import { useOrderDetails } from "../../contexts/OrderDetails";
import AlertBanner from "../common/AlertBanner";

//Define the orderphase type
type OrderPhase = "inProgress" | "review" | "complete";

//Define the API response interface
interface OrderResponse {
  orderNumber: number;
}

interface OrderConfirmationProps {
  setOrderPhase: (phase: OrderPhase) => void;
}

export default function OrderConfirmation({ setOrderPhase }: OrderConfirmationProps) {
  const { resetOrder } = useOrderDetails();
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    axios
      // in a real app we would get order details from context
      // and send with POST
      .post<OrderResponse>(`http://localhost:3030/order`)
      .then((response: AxiosResponse<OrderResponse>) => {
        setOrderNumber(response.data.orderNumber);
      })
      .catch(() => setError(true));
  }, []);

  function handleClick() {
    // clear the order details
    resetOrder();

    // send back to order page
    setOrderPhase("inProgress");
  }

  const newOrderButton = (
    <Button onClick={handleClick}>Create new order</Button>
  );

  if (error) {
    return (
      <>
        <AlertBanner message={null} variant={null} />
        {newOrderButton}
      </>
    );
  }

  if (orderNumber) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Thank You!</h1>
        <p>Your order number is {orderNumber}</p>
        <p style={{ fontSize: "25%" }}>
          as per our terms and conditions, nothing will happen now
        </p>
        {newOrderButton}
      </div>
    );
  } else {
    return <div>Loading</div>;
  }
}
