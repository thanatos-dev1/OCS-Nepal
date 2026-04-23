import type { Offer, OfferInput } from "./types";
import api from "./client";
import { adaptProduct, type ApiProduct } from "./products";

type ApiOffer = {
  ID: number;
  ProductID: number;
  Product: ApiProduct;
  SalePrice: number;
  StartsAt: string;
  EndsAt?: string;
  Label?: string;
};

function adaptOffer(o: ApiOffer): Offer {
  const product = adaptProduct(o.Product);
  const discountPercent = product.price > 0
    ? Math.round(((product.price - o.SalePrice) / product.price) * 100)
    : 0;
  return {
    id: String(o.ID),
    productId: String(o.ProductID),
    product,
    salePrice: o.SalePrice,
    discountPercent,
    startsAt: o.StartsAt,
    endsAt: o.EndsAt,
    label: o.Label,
  };
}

export async function getOffers(): Promise<Offer[]> {
  const { data } = await api.get<ApiOffer[]>("/offers");
  return Array.isArray(data) ? data.map(adaptOffer) : [];
}

export async function createOffer(input: OfferInput): Promise<Offer> {
  const { data } = await api.post<ApiOffer>("/offers", input);
  return adaptOffer(data);
}

export async function updateOffer(id: number, input: OfferInput): Promise<Offer> {
  const { data } = await api.put<ApiOffer>(`/offers/${id}`, input);
  return adaptOffer(data);
}

export async function deleteOffer(id: number): Promise<void> {
  await api.delete(`/offers/${id}`);
}
