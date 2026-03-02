# EaaS Client SDK – Documentation

## Product context

EaaS (Estimation-as-a-Service) powers the Universal Flex Credit Estimator on Salesforce.com, unifying Agentforce and Data 360 estimation experiences. The SDK is a client wrapper around the **EaaS External Estimation xAPI**: it provides use cases (templates and topics), taxonomy (industries, company sizes), and sizing and pricing calculations.

**Backend API:** [EaaS External Estimation xAPI](https://anypoint.mulesoft.com/exchange/portals/hyperscalers/628af2fd-17eb-4c1e-9c26-d0dfe921277a/eaas-external-estimation-xapi/minor/1.0/settings/) (Anypoint Exchange). For API contracts, error responses, and endpoint specifications, refer to that documentation.

---

## API Reference

The SDK wraps the [EaaS External Estimation xAPI](https://anypoint.mulesoft.com/exchange/portals/hyperscalers/628af2fd-17eb-4c1e-9c26-d0dfe921277a/eaas-external-estimation-xapi/minor/1.0/settings/). Endpoint details, request/response schemas, and error responses are described in that API documentation on Anypoint Exchange.

### Installation

```bash
npm install @sfdc/eaas
```

Import from `@sfdc/eaas` or `@sfdc/eaas/sdk` (both resolve to the same entry):

```ts
import eaasSDK, { type SDKConfig, type Estimation, type Agentforce, type Taxonomy } from "@sfdc/eaas/sdk";
// or
import { eaasSDK, EaaSClientSDK } from "@sfdc/eaas";
```

### Initialization

Create the SDK with `eaasSDK(config)`. All of `baseUrl`, `clientId`, and `clientSecret` are required; the SDK sends `client_id` and `client_secret` as headers to the API.

**Authentication.** Access to the API requires a client id and client secret. These credentials must be requested from the **Hyperscalers EaaS team**.

**SDKConfig**

| Property        | Type     | Required | Description                                      |
|----------------|----------|----------|--------------------------------------------------|
| `baseUrl`      | `string` | Yes      | EaaS API base URL (e.g. Mule API Gateway).       |
| `clientId`     | `string` | Yes      | Client identifier (obtain from Hyperscalers EaaS team). |
| `clientSecret` | `string` | Yes      | Client secret (obtain from Hyperscalers EaaS team).      |
| `httpClient`   | `HttpClient` | No   | Custom HTTP client (default: fetch-based).      |
| `logger`       | `Logger` | No       | Custom logger (default: no-op).                  |
| `providers`    | `SDKProviders` | No   | Overrides for http client, logger, services.    |

**Example (env-based, e.g. Vite)**

```ts
const sdk = eaasSDK({
  baseUrl: import.meta.env.VITE_SDK_BASE_URL,
  clientId: import.meta.env.VITE_SDK_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SDK_CLIENT_SECRET,
});
```

Use a single SDK instance per app (or per server context in SSR) so that the internal config cache is reused.

**Config cache.** The SDK loads all data required for estimation in a single request to the `/configs` endpoint. That response is cached in memory to avoid redundant calls. The cache is process-scoped and is cleared when the page or process is reloaded; it is not persisted to any storage.

### SDK instance

The object returned by `eaasSDK(config)` has four services:

| Property           | Description |
|--------------------|-------------|
| **sdk.estimations** | Create, update, and share estimations; fetch configs. See [Estimations](#estimations). |
| **sdk.agentforce**  | Templates, topics, credits/price calculations, estimation config items. See [Agentforce](#agentforce). |
| **sdk.data360**     | Data foundation inputs, use cases, meters, estimation config items. See [Data 360](#data-360). |
| **sdk.taxonomy**    | Industries, company sizes, clouds, settings. See [Taxonomy](#taxonomy). |

### Package exports

From `@sfdc/eaas` / `@sfdc/eaas/sdk`:

- **eaasSDK** – Factory: `(config: SDKConfig) => EaaSClientSDK`
- **EaaSClientSDK** – Class (constructor takes `SDKConfig`)
- **SDKConfig** – Config type for initialization
- **SDKProviders** – Optional providers type for custom http/logger/services
- **Agentforce** – Namespace of types (Template, Topic, TopicInputValue, EstimationConfigItem, etc.)
- **Data360** – Namespace of types (DataFoundationInput, UseCase, UseCaseEstimationConfig, EstimationConfigItem, etc.)
- **Taxonomy** – Namespace of types (Industry, CompanySize, SettingItem, Cloud)
- **EstimationCreateRequest** – `{ industryId: string; companySizeId: string }`
- **Estimation** – Full estimation object (id, industryId, companySizeId, totalCredits, totalPrice, config, etc.)
- **EstimationConfig** – Product config entry (`product`, `config`); **EstimationInputValue** – `{ inputKey, value }`

### Localization

The backend serves localized content (labels, descriptions, currency) based on the `Accept-Language` header. The estimations service exposes `getConfigs(acceptLanguage?)`; the default is `"en-US"`. When the SDK loads config (e.g. via taxonomy, Agentforce, or Data 360), it uses this single config fetch. To drive the estimator in the user's locale, ensure the first config load is done with the desired language (e.g. from the application's locale or browser settings). The cached config will then reflect that language until the cache is cleared.

---

## Estimations

Service: **sdk.estimations**

Create, update, and share estimations. Estimations are scoped by industry and company size; you then add product config (Agentforce and/or Data 360) and update the estimation so totals are computed. For a full step-by-step flow, see [How to estimate](#how-to-estimate).

### Methods

#### createEstimation(body)

```ts
createEstimation(body: EstimationCreateRequest): Promise<Estimation>
```

Creates a new estimation with the given industry and company size. The API returns an `id`; the SDK returns a minimal `Estimation` with `id`, `industryId`, and `companySizeId`. Add product config and call `updateEstimation` to persist and get totals.

#### updateEstimation(estimation)

```ts
updateEstimation(estimation: Estimation): Promise<Estimation>
```

Updates an existing estimation (PATCH by `estimation.id`). The SDK recomputes `totalCredits` and `totalPrice` from `estimation.config` and sends the full body. Returns the same estimation with totals set.

#### shareEstimation(estimation)

```ts
shareEstimation(estimation: Estimation): Promise<void>
```

Marks the estimation as shared so that it is visible when the estimation is loaded by id (e.g. via a shareable link). No response body.

#### getConfigs(acceptLanguage?)

```ts
getConfigs(acceptLanguage?: string): Promise<EstimationsConfigResponse>
```

Fetches the full config payload (taxonomy, Agentforce templates, Data 360 use cases and meters). Default `acceptLanguage` is `"en-US"`. Typically you do not call this directly; `sdk.agentforce`, `sdk.data360`, and `sdk.taxonomy` use an internal cache that calls this once. For error handling and response details, see the [EaaS External Estimation xAPI](https://anypoint.mulesoft.com/exchange/portals/hyperscalers/628af2fd-17eb-4c1e-9c26-d0dfe921277a/eaas-external-estimation-xapi/minor/1.0/settings/) documentation.

### Types (Estimations)

#### EstimationCreateRequest

| Field           | Type     | Description        |
|----------------|----------|--------------------|
| `industryId`   | `string` | Taxonomy industry. |
| `companySizeId`| `string` | Taxonomy company size. |

#### Estimation

| Field                | Type     | Description |
|----------------------|----------|-------------|
| `id`                 | `string` | Set after create. |
| `industryId`          | `string` | |
| `companySizeId`      | `string` | |
| `step?`              | `string` | Optional. |
| `totalCredits?`      | `number` | Set by `updateEstimation`. |
| `totalPrice?`         | `number` | Set by `updateEstimation`. |
| `totalPriceCurrency?`| `string` | Optional. |
| `isDownloaded?`      | `boolean`| Optional. Set when the user downloads a PDF or equivalent; PDF generation is not part of the SDK. |
| `isSpecialistContacted?` | `boolean` | Optional. |
| `config?`            | `EstimationConfig[]` | Product-specific config (Agentforce, Data 360). |

#### Estimation.config shape

`Estimation.config` is an array of product configs. Each entry has:

- **product** – `string` (e.g. `"agentforce"`, `"data360"`).
- **config** – Product-specific:
  - **Agentforce:** array of `Agentforce.EstimationConfigItem`. Each item has `template: { templateId, credits, price, topics }` (topic-level selection and input values). See [Agentforce](#agentforce).
  - **Data 360:** a single `Data360.EstimationConfigItem` (not an array). Has `inputDataFoundation`, `useCases`, `meters`, `credits`, `price`. See [Data 360](#data-360).

The SDK's `updateEstimation` computes `totalCredits` and `totalPrice` from all product configs (summing Agentforce template items and the Data 360 item).

### Usage (Estimations)

Create an estimation, add product config (Agentforce and/or Data 360), then update so the SDK computes totals. Full flow: [How to estimate](#how-to-estimate).

**Example: add one Agentforce item and update**

```ts
const sdk = eaasSDK({ baseUrl, clientId, clientSecret });

// 1. Create estimation
const estimation = await sdk.estimations.createEstimation({
  industryId: selectedIndustryId,
  companySizeId: selectedCompanySizeId,
});

// 2. Build config (e.g. add Agentforce item from sdk.agentforce.createEstimationConfigItem)
const newConfig = estimation.config ? [...estimation.config] : [];
const afEntry = newConfig.find((c) => c.product === "agentforce");
if (!afEntry) {
  newConfig.push({ product: "agentforce", config: [agentforceConfigItem] });
} else {
  (afEntry.config as Agentforce.EstimationConfigItem[]).push(agentforceConfigItem);
}

// 3. Update estimation; totals are computed by the SDK
const updated = await sdk.estimations.updateEstimation({
  ...estimation,
  config: newConfig,
});
// updated.totalCredits, updated.totalPrice are set
```

For Data 360, there is one entry with `product: "data360"` and `config` is a single `Data360.EstimationConfigItem` (see [Data 360](#data-360)).

---

## Agentforce

Service: **sdk.agentforce**

Templates and topics (use cases), credits/price calculations, and estimation config items for Agentforce. All config is loaded from the SDK's internal cache (one fetch, then reused).

### Methods

#### getTemplates()

```ts
getTemplates(): Promise<Agentforce.Template[]>
```

Returns all Agentforce templates. Each template includes its `topics` array.

#### getTopicsByTemplate(templateId)

```ts
getTopicsByTemplate(templateId: string): Promise<Agentforce.Topic[]>
```

Returns the topics for the given template. Returns `[]` if the template is not found.

#### getTopicById(templateId, topicId)

```ts
getTopicById(templateId: string, topicId: string): Promise<Agentforce.Topic | undefined>
```

Returns a single topic by template and topic id, or `undefined` if not found.

#### getActionCountByTopic(topic)

```ts
getActionCountByTopic(topic: Agentforce.Topic): Promise<number>
```

Reads the topic's action count from `topic.metadata.actionCount`. Throws if missing or invalid.

#### getTotalActionsByTopic(templateId, topicId, inputValues?)

```ts
getTotalActionsByTopic(
  templateId: string,
  topicId: string,
  inputValues?: Agentforce.TopicInputValue[]
): Promise<number>
```

Evaluates the topic's formula with the given input values (substitutes `{inputKey}` in the formula) and multiplies by the topic's action count. Throws if the topic is not found or the formula does not evaluate to a number.

#### getTotalCreditsByTopic(templateId, topicId, inputValues?)

```ts
getTotalCreditsByTopic(
  templateId: string,
  topicId: string,
  inputValues?: Agentforce.TopicInputValue[]
): Promise<number>
```

Total actions for the topic (via `getTotalActionsByTopic`) multiplied by the taxonomy setting `CREDITS_X_ACTIONS`. Throws if the topic or setting is missing.

#### getTotalPriceByTopic(templateId, topicId, inputValues?)

```ts
getTotalPriceByTopic(
  templateId: string,
  topicId: string,
  inputValues?: Agentforce.TopicInputValue[]
): Promise<number>
```

Total credits for the topic (via `getTotalCreditsByTopic`) multiplied by the taxonomy setting `SKU_CREDIT_VALUE`. Throws if the topic or setting is missing.

#### createEstimationConfigItem(template, currency)

```ts
createEstimationConfigItem(
  template: Agentforce.Template,
  currency: string
): Promise<Agentforce.EstimationConfigItem>
```

Builds an estimation config item for the template: one entry per topic with `selected: false` and default inputs. Use this when adding an Agentforce template to an estimation; then call `updateEstimationConfigItemTopicValues` when the user toggles topics or changes inputs.

#### updateEstimationConfigItemTopicValues(configItem, topicId, selected, inputValues)

```ts
updateEstimationConfigItemTopicValues(
  estimationConfigItem: Agentforce.EstimationConfigItem,
  topicId: string,
  selected: boolean,
  inputValues: Agentforce.TopicInputValue[]
): Promise<Agentforce.EstimationConfigItem>
```

Updates one topic's selection and input values in the config item, recomputes credits and price for that topic, and rolls up `credits` and `price` on the config item. Returns a new config item; use it to replace the previous one in state.

### Types (Agentforce namespace)

#### Template

| Field            | Type     | Description |
|-----------------|----------|-------------|
| `id`            | `string` | |
| `systemName`    | `string` | |
| `displayName`   | `string` | |
| `description?`  | `string` | Optional. |
| `status?`       | `string` | Optional. |
| `targetAudience?` | `string` | Optional. |
| `metadata?`     | `object` | Optional. |
| `cloudId?`      | `string` | Optional. |
| `topics`        | `Topic[]`| Topics in this template. |

#### Topic

| Field               | Type     | Description |
|---------------------|----------|-------------|
| `id`                | `string` | |
| `systemName`        | `string` | |
| `displayName`       | `string` | |
| `description?`      | `string` | Optional. |
| `status?`           | `string` | Optional. |
| `minimumCredits`    | `number` | |
| `maximumCredits`    | `number` | |
| `mostLikelyCredits` | `number` | |
| `targetAudience?`   | `string` | Optional. |
| `metadata?`         | `Record<string, any>` | Optional (e.g. `actionCount`). |
| `formula`           | `string` | Expression with `{inputKey}` placeholders. |
| `inputs?`           | `TopicInput[]` | Optional. |
| `cloudId?`          | `string` | Optional. |

#### TopicInput

| Field          | Type     | Description |
|----------------|----------|-------------|
| `key`          | `string` | Input key (used in formula). |
| `label`        | `string` | |
| `description?` | `string` | Optional. |
| `dataType`     | `string` | e.g. NUMBER, PERCENTAGE. |
| `config?`      | `Record<string, any>` | Optional (e.g. min, max, default). |

#### TopicInputValue

| Field        | Type  | Description |
|--------------|-------|-------------|
| `inputKey`   | `string` | Matches `TopicInput.key`. |
| `value`      | `any`    | Value for the formula. |

#### TopicEstimationConfig

| Field             | Type     | Description |
|-------------------|----------|-------------|
| `topicId`         | `string` | |
| `selected?`       | `boolean`| Whether the topic is included. |
| `inputs`          | `TopicInputValue[]` | |
| `actionsQuantity?`| `number` | Set when selected. |
| `totalActions?`   | `number` | Set when selected. |
| `credits`         | `number` | |
| `price`           | `number` | |

#### EstimationConfigItem

| Field                | Type     | Description |
|----------------------|----------|-------------|
| `template`| `object` | Nested: `templateId`, `credits`, `price`, `topics` (TopicEstimationConfig[]). |
| `credits`            | `number` | Sum of selected topics' credits. |
| `price`              | `number` | Sum of selected topics' price. |
| `topics`             | `TopicEstimationConfig[]` | One per topic in the template. |

### Usage (Agentforce)

**Calculator: list templates → topics → credits/price per topic with inputs**

```ts
const templates = await sdk.agentforce.getTemplates();
const topics = await sdk.agentforce.getTopicsByTemplate(selectedTemplateId);

const inputValuesArray: Agentforce.TopicInputValue[] = Object.entries(values).map(
  ([inputKey, value]) => ({ inputKey, value })
);
const [credits, price] = await Promise.all([
  sdk.agentforce.getTotalCreditsByTopic(templateId, topicId, inputValuesArray),
  sdk.agentforce.getTotalPriceByTopic(templateId, topicId, inputValuesArray),
]);
```

**Add Agentforce to estimation: create config item → update topic selection/inputs**

```ts
const template = templates.find((t) => t.id === templateId);
const config = await sdk.agentforce.createEstimationConfigItem(template, "USD");

// When user toggles a topic or changes an input:
const updated = await sdk.agentforce.updateEstimationConfigItemTopicValues(
  config,
  topicId,
  selected,
  inputValues
);
// Use updated as the new config; add to estimation and call sdk.estimations.updateEstimation
```

---

## Data 360

Service: **sdk.data360**

Data 360 (Data Cloud) estimation: data foundation inputs, use cases, meters, and estimation config items. Credits and price are derived from foundation inputs and use case inputs via intermediate formulas and meter definitions. All config is loaded from the SDK's internal cache (shared with `sdk.estimations.getConfigs`).

### Meters and credit calculation

In Data 360, **meters** are the billable items: they define how consumption is translated into credits and price. Each use case is linked to one or more meters. The SDK computes estimation totals as follows:

1. **Data foundation inputs** and **inputs for each selected use case** are collected.
2. For each meter, the SDK evaluates that meter formula against these values to derive **consumption**, **credits**, and **price** for that meter.
3. Meter formulas may depend on **intermediate formulas** internally; those are implementation details and are not exposed in the public API. SDK consumers work only with data foundation inputs, use cases, and the resulting meter totals (credits and price) on the estimation config item.

The aggregated credits and price for the Data 360 config item are the sum of all meter results. This model aligns with how the Data 360 calculator is specified (e.g. in spreadsheet form): foundation and use case inputs drive meter formulas, which produce the final billable amounts.

### Methods

#### getDataFoundationInputs()

```ts
getDataFoundationInputs(): Promise<Data360.DataFoundationInput[]>
```

Returns the list of data foundation inputs (e.g. row volumes, ingestion settings). Use these to build the first step of a Data 360 estimation flow; user values are stored in `EstimationConfigItem.inputDataFoundation`.

#### getUseCases()

```ts
getUseCases(): Promise<Data360.UseCase[]>
```

Returns all Data 360 use cases. Each use case has `inputs` (questions and input definitions). Use for use case selection and to create use case estimation configs.

#### getUseCaseById(id)

```ts
getUseCaseById(id: string): Promise<Data360.UseCase | undefined>
```

Returns a single use case by id, or `undefined` if not found.

#### getMeters()

```ts
getMeters(): Promise<Data360.Meter[]>
```

Returns the list of meters used for credit and price calculation. Meters define formulas (e.g. tiered pricing) that consume context values from data foundation and use case inputs.

#### getMeterById(id)

```ts
getMeterById(id: string): Promise<Data360.Meter | undefined>
```

Returns a single meter by id, or `undefined` if not found.

#### createEstimationConfigItem()

```ts
createEstimationConfigItem(): Promise<Data360.EstimationConfigItem>
```

Creates a new Data 360 estimation config item with default data foundation values and empty use cases. Credits and price are recalculated from meters. Use this when starting a Data 360 branch of an estimation; then collect foundation inputs, add use cases, and call `updateEstimationConfigItemValues` / `updateEstimationConfigItemUseCaseValues` as the user edits.

#### createUseCaseEstimationConfig(useCase)

```ts
createUseCaseEstimationConfig(useCase: Data360.UseCase): Promise<Data360.UseCaseEstimationConfig>
```

Builds a use case estimation config for the given use case with default input values. Use when the user adds a use case to the estimation; then pass the result (or an updated one) to `updateEstimationConfigItemUseCaseValues`.

#### updateUseCaseEstimationConfig(useCaseEstimationConfig, inputValues)

```ts
updateUseCaseEstimationConfig(
  useCaseEstimationConfig: Data360.UseCaseEstimationConfig,
  inputValues: EstimationInputValue[]
): Promise<Data360.UseCaseEstimationConfig>
```

Updates a use case estimation config with new input values and recalculates credits/price for that use case. Returns the updated config.

#### updateEstimationConfigItemValues(estimationConfigItem)

```ts
updateEstimationConfigItemValues(
  estimationConfigItem: Data360.EstimationConfigItem
): Promise<Data360.EstimationConfigItem>
```

Recalculates meters and rolls up credits and price for the entire Data 360 config item from current data foundation and use case values. Call after changing foundation inputs or use case inputs.

#### updateEstimationConfigItemUseCaseValues(estimationConfigItem, useCaseId, inputValues)

```ts
updateEstimationConfigItemUseCaseValues(
  estimationConfigItem: Data360.EstimationConfigItem,
  useCaseId: string,
  inputValues: EstimationInputValue[]
): Promise<Data360.EstimationConfigItem>
```

Updates one use case's inputs within the config item (adds the use case if missing), recalculates meters and totals, and returns the updated config item. Use when the user saves or changes a use case's inputs.

### Types (Data360 namespace)

#### DataFoundationInput / InputItem

| Field         | Type     | Description |
|---------------|----------|-------------|
| `id`          | `string` | |
| `key`         | `string` | Input key (used in formulas and in `EstimationInputValue.inputKey`). |
| `label`       | `string` | |
| `description?`| `string` | Optional. |
| `type`        | `string` | e.g. NUMBER, BOOLEAN. |
| `config`      | `Record<string, any>` | Optional (e.g. min, max, default). |

#### UseCase

| Field         | Type     | Description |
|---------------|----------|-------------|
| `id`          | `string` | |
| `key`         | `string` | |
| `title`       | `string` | |
| `description?`| `string` | Optional. |
| `inputs`      | `UseCaseInput[]` | Input definitions for this use case. |

#### UseCaseInput

Same shape as `InputItem` (key, label, type, config, etc.).

#### UseCaseEstimationConfig

| Field    | Type     | Description |
|----------|----------|-------------|
| `useCase`| `string` | Use case id. |
| `inputs` | `EstimationInputValue[]` | User values for the use case inputs. |
| `credits`| `number` | |
| `price`  | `number` | |

#### MeterEstimationConfig

| Field     | Type     | Description |
|-----------|----------|-------------|
| `meterId` | `string` | |
| `credits` | `number` | |
| `price`   | `number` | |
| `discount`| `number` | |

#### EstimationConfigItem

| Field                | Type     | Description |
|----------------------|----------|-------------|
| `inputDataFoundation`| `EstimationInputValue[]` | Values for data foundation inputs. |
| `useCases`           | `UseCaseEstimationConfig[]` | Use cases added to this estimation. |
| `meters`             | `MeterEstimationConfig[]` | Computed meter results. |
| `credits`            | `number` | Sum of meter credits. |
| `price`              | `number` | Sum of meter price. |

### Usage (Data 360)

**Data 360 in an estimation: one config item per estimation**

Unlike Agentforce (multiple templates per estimation), Data 360 has a single config item per estimation. You create it once, then update foundation inputs and add/update use cases.

```ts
// 1. Create Data 360 config item (e.g. when user chooses "Add Data 360")
const data360Config = await sdk.data360.createEstimationConfigItem();

// 2. User fills data foundation inputs
const updatedAfterFoundation = await sdk.data360.updateEstimationConfigItemValues({
  ...data360Config,
  inputDataFoundation: newFoundationValues,
});

// 3. User adds a use case and fills its inputs
const useCaseConfig = await sdk.data360.createUseCaseEstimationConfig(selectedUseCase);
const updatedWithUseCase = await sdk.data360.updateEstimationConfigItemUseCaseValues(
  updatedAfterFoundation,
  selectedUseCase.id,
  useCaseInputValues
);

// 4. Add to estimation and update (see Estimations and How to estimate)
const newConfig = estimation.config ? [...estimation.config] : [];
const data360Entry = { product: 'data360', config: updatedWithUseCase };
const idx = newConfig.findIndex((c) => c.product === 'data360');
if (idx === -1) newConfig.push(data360Entry);
else newConfig[idx] = data360Entry;
const updated = await sdk.estimations.updateEstimation({ ...estimation, config: newConfig });
```

---

## Taxonomy

Service: **sdk.taxonomy**

Taxonomy data (industries, company sizes, clouds, settings) for the estimator. Used for estimation creation (industry and company size), progressive disclosure (e.g. filtering use cases), and for pricing (settings like credits-per-action and credit value). All data is loaded from the SDK's internal cache.

### Methods

#### getIndustries()

```ts
getIndustries(): Promise<Taxonomy.Industry[]>
```

Returns the list of industries. Use for industry selection (e.g. dropdown) and for estimation creation (`EstimationCreateRequest.industryId`).

#### getCompanySizes()

```ts
getCompanySizes(): Promise<Taxonomy.CompanySize[]>
```

Returns the list of company sizes. Use for company size selection and for estimation creation (`EstimationCreateRequest.companySizeId`).

#### getClouds()

```ts
getClouds(): Promise<Taxonomy.Cloud[]>
```

Returns the list of clouds. May be empty if not present in config. Use for filtering or display when relevant.

#### getSettingByKey(key)

```ts
getSettingByKey(key: string): Promise<Taxonomy.SettingItem | undefined>
```

Returns a single setting by key (e.g. `"CREDITS_X_ACTIONS"`, `"SKU_CREDIT_VALUE"`). Used internally by `sdk.agentforce` for credits and price calculations. Returns `undefined` if the key is not found.

### Types (Taxonomy namespace)

#### Industry

| Field          | Type     | Description |
|----------------|----------|-------------|
| `id`           | `string` | |
| `systemName`   | `string` | |
| `displayName`  | `string` | |
| `description?` | `string` | Optional. |
| `icon?`        | `string` | Optional. |

#### CompanySize

| Field          | Type     | Description |
|----------------|----------|-------------|
| `id`           | `string` | |
| `systemName`   | `string` | |
| `displayName`  | `string` | |
| `description?` | `string` | Optional. |
| `sizeDetails`  | `string` | e.g. numeric range. |

#### SettingItem

| Field          | Type     | Description |
|----------------|----------|-------------|
| `key`          | `string` | e.g. CREDITS_X_ACTIONS, SKU_CREDIT_VALUE. |
| `name`         | `string` | |
| `description?` | `string` | Optional. |
| `value`        | `string` | Stored value (often numeric). |

#### Cloud

| Field          | Type     | Description |
|----------------|----------|-------------|
| `id`           | `string` | |
| `displayName`  | `string` | |
| `description?` | `string` | Optional. |

### Usage (Taxonomy)

Load industries and company sizes in parallel for dropdowns (e.g. estimation or calculator config):

```ts
const [industries, companySizes] = await Promise.all([
  sdk.taxonomy.getIndustries(),
  sdk.taxonomy.getCompanySizes(),
]);
// Use for <select> options; industryId / companySizeId for createEstimation
```

---

## How to estimate

This guide walks through building a Flex Credit estimate using the EaaS SDK, following the same flow as the **react-test-app** example: create an estimation with industry and company size, then add Agentforce and/or Data 360 product config, and finally update the estimation to get totals.

### Overview

1. **Create the estimation** with selected industry and company size.
2. **(Optional) Create a Data 360 use case estimation item** — data foundation inputs, then add use cases and their inputs.
3. **(Optional) Create an Agentforce estimation item** — pick a template, select topics, set input values.
4. **Update the estimation** with the combined config so the SDK (and API) can compute total credits and price.

You can add only Agentforce, only Data 360, or both. The estimation's `config` array holds one entry per product; Agentforce can have multiple template items, Data 360 has a single config item.

### Prerequisites

- SDK initialized with `baseUrl`, `clientId`, and `clientSecret` (see [API Reference](#api-reference)).
- Taxonomy loaded (e.g. `sdk.taxonomy.getIndustries()`, `sdk.taxonomy.getCompanySizes()`) so the user can pick industry and company size.

### Step 1: Create the estimation with selected industry and company size

The user must select an industry and a company size. Then create the estimation:

```ts
const estimation = await sdk.estimations.createEstimation({
  industryId: selectedIndustryId,
  companySizeId: selectedCompanySizeId,
});
// estimation.id is set; estimation.config is undefined initially
```

Keep this `estimation` in state; you will add product config to `estimation.config` and call `updateEstimation` after adding or changing items.

### Step 2: Create a Data 360 use case estimation item (optional)

If the user adds Data 360 to the estimate:

1. **Create the Data 360 config item** (once per estimation's Data 360 "branch"):

   ```ts
   const data360Config = await sdk.data360.createEstimationConfigItem();
   ```

2. **Collect data foundation inputs.**  
   Use `sdk.data360.getDataFoundationInputs()` to get the list of inputs. Bind form fields to `data360Config.inputDataFoundation` (by `inputKey` and `value`). When the user submits, recalculate:

   ```ts
   const updated = await sdk.data360.updateEstimationConfigItemValues({
     ...data360Config,
     inputDataFoundation: newValues,
   });
   ```

3. **Add use cases.**  
   Use `sdk.data360.getUseCases()` for the list. When the user selects a use case, create a use case estimation config and let them fill inputs:

   ```ts
   const useCaseConfig = await sdk.data360.createUseCaseEstimationConfig(selectedUseCase);
   // ... user edits useCaseConfig.inputs ...
   const withUseCase = await sdk.data360.updateEstimationConfigItemUseCaseValues(
     data360Config,
     selectedUseCase.id,
     useCaseInputValues
   );
   ```

4. **Attach the Data 360 config to the estimation** (see Step 4).  
   There is exactly one Data 360 entry in `estimation.config` (product `"data360"`); you replace or set that entry with the final `Data360.EstimationConfigItem`.

### Step 3: Create an Agentforce estimation item (optional)

If the user adds Agentforce to the estimate:

1. **Choose a template.**  
   Use `sdk.agentforce.getTemplates()`. When the user selects a template:

   ```ts
   const template = templates.find((t) => t.id === selectedTemplateId);
   const agentforceConfig = await sdk.agentforce.createEstimationConfigItem(template, 'USD');
   ```

2. **Select topics and set input values.**  
   For each topic in the template, the user can toggle selection and change inputs. Use:

   ```ts
   const updated = await sdk.agentforce.updateEstimationConfigItemTopicValues(
     agentforceConfig,
     topicId,
     selected,
     inputValues
   );
   ```

   Replace `agentforceConfig` with `updated` in state. When the user is done, pass this config item to the estimation (Step 4). You can add multiple Agentforce items (multiple templates) by pushing to the `config` entry whose `product === 'agentforce'`.

### Step 4: Update the estimation

Merge the new or updated product config into `estimation.config` and call `updateEstimation`:

```ts
let newConfig: EstimationConfig[] = estimation.config ? [...estimation.config] : [];

// If adding/updating Data 360 (single item)
const data360Index = newConfig.findIndex((c) => c.product === 'data360');
const data360Entry = { product: 'data360' as const, config: data360ConfigItem };
if (data360Index === -1) {
  newConfig.push(data360Entry);
} else {
  newConfig[data360Index] = data360Entry;
}

// If adding Agentforce (append to agentforce config array)
if (agentforceConfigItem) {
  const afIndex = newConfig.findIndex((c) => c.product === 'agentforce');
  if (afIndex === -1) {
    newConfig.push({ product: 'agentforce', config: [agentforceConfigItem] });
  } else {
    const afConfig = newConfig[afIndex].config as Agentforce.EstimationConfigItem[];
    newConfig[afIndex] = { ...newConfig[afIndex], config: [...afConfig, agentforceConfigItem] };
  }
}

const updated = await sdk.estimations.updateEstimation({
  ...estimation,
  config: newConfig,
});
// updated.totalCredits, updated.totalPrice are set
```

After this, display `updated.totalCredits` and `updated.totalPrice` (and optionally `shareEstimation` for sharing).

### Reference implementation

The **react-test-app** implements this flow:

- **EstimationPage** — Step 1 (create estimation), product choice, and Step 4 (add Agentforce or Data 360 item and call `updateEstimation`).
- **Data360NewEstimationItem** — Step 2: create Data 360 config, Data360FoundationInputsForm, use case selector, Data360UseCaseForm, then call `onAdd(updated)` which triggers update.
- **AgentforceNewEstimationItem** — Step 3: template picker, topic rows (AgentforceTopicConfigRow), then "Add to Estimation" which passes the config item up so the parent can update the estimation.

See `resources/react-test-app/src/pages/EstimationPage.tsx` and the components under `resources/react-test-app/src/components/` for the exact wiring and state handling.
