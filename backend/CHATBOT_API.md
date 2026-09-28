# Chatbot product API contract for n8n

Use the live API as the source of truth for catalog data and validate final LLM
recommendations before sending them to a customer.

## Authentication

All endpoints in this document require an API key. Set a long random
`CHATBOT_API_KEY` in the backend environment, then send the same value from n8n
as the `X-API-Key` request header. Requests with no key or an incorrect key
receive `401 Unauthorized`.

```text
X-API-Key: your-chatbot-api-key
```

## List products

`GET /api/chatbot/products/`

Optional query parameters:

- `category`
- `make`, `model`, `year`, and optional `engine_variant` — all of make/model/year
  are required to return a fitment-locked product. Year is matched inclusively against
  the compatibility range.
- `min_price`, `max_price`
- `in_stock` — `true` by default.
- `fields` — comma-separated response fields. The default compact set is `id,name,category,price,link,status,in_stock,requires_fitment`.
- `page` — defaults to `1`.
- `page_size` — defaults to `20`; maximum is `50`.

The response is always under `data.products` with `data.pagination`. When vehicle data
is missing, fitment-locked products are excluded from `data.products` and summarized in
`data.needs_vehicle_info`; use this to ask for vehicle make, model, and year.

`fuel_type` is accepted as a future-facing parameter but is currently ignored because the
Product model has no fuel-type field.

## Search products

`GET /api/chatbot/products/search/?q=quiet+street+exhaust&make=Honda&model=Activa%206G&year=2023`

The same hard filters run in SQL before ranking. `limit` defaults to `10` and has a hard
maximum of `20`. The current ranking mode is `lexical_fallback_no_pgvector`; add a
pgvector `Product.embedding` column and product embedding generation job to enable true
semantic ranking. A zero hard-filter result returns `data.no_match=true` and never falls
back to an unfiltered catalog.

## Validate a final LLM selection

`POST /api/chatbot/products/validate/`

```json
{"product_ids": ["product-uuid-1", "product-uuid-2"]}
```

Only real, active, in-stock products appear in `data.valid_products`, with database-derived
price and link. Check this response immediately before n8n sends the final recommendation.
