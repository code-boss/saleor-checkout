import { getClient } from "@/checkout-app/backend/client";
import { envVars, serverEnvVars } from "@/checkout-app/constants";
import {
  OrderDetailsQuery,
  OrderDetailsQueryVariables,
  OrderFragment,
  OrderDetailsDocument,
} from "@/checkout-app/graphql";

import { Errors } from "./types";

export const getOrderDetails = async (
  id: OrderDetailsQueryVariables["id"]
): Promise<
  | {
      data: OrderFragment;
    }
  | {
      errors: Errors;
    }
> => {
  const { data, error } = await getClient(
    envVars.apiUrl,
    serverEnvVars.appToken
  )
    .query<OrderDetailsQuery, OrderDetailsQueryVariables>(
      OrderDetailsDocument,
      { id }
    )
    .toPromise();

  if (error) {
    throw error;
  }

  if (!data?.order) {
    return {
      errors: ["ORDER_DOES_NOT_EXIST"],
    };
  }

  return { data: data.order };
};
