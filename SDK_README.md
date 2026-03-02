# EaaS SDK – Guía de exportación a otra app

Resumen de lógica y uso para integrar el SDK en otra aplicación (React, Angular, Vue, Nuxt, etc.).

---

## 0. Instalación del SDK en otro proyecto

### Opción A: Paquete desde Nexus/npm (cuando esté publicado)

```bash
npm install @sfdc/eaas
```

### Opción B: Tarball local (`.tgz`)

Si tienes el archivo `sfdc-eaas-0.3.0.tgz` (o similar):

1. **Copiar el tarball** al nuevo proyecto, por ejemplo en una carpeta `sdk/`:
   ```text
   tu-proyecto/
   ├── sdk/
   │   └── sfdc-eaas-0.3.0.tgz
   ├── package.json
   └── ...
   ```

2. **Añadir la dependencia en `package.json`:**
   ```json
   "dependencies": {
     "@sfdc/eaas": "file:sdk/sfdc-eaas-0.3.0.tgz"
   }
   ```

3. **Instalar dependencias:**
   ```bash
   npm install
   ```

4. **Variables de entorno** (Vite: prefijo `VITE_`; otros bundlers usan su convención). Crear `.env` o `.env.example`:
   ```env
   VITE_SDK_BASE_URL=https://{env}.mule-api-gateway.com
   VITE_SDK_CLIENT_ID=your-client-id
   VITE_SDK_CLIENT_SECRET=your-client-secret
   VITE_SDK_USE_MOCKS=false
   ```
   `VITE_SDK_USE_MOCKS` opcional; `"true"` activa datos mock en desarrollo.

5. **Instancia única (recomendado).** Crear un módulo que exporte una sola instancia y usarla en toda la app; no instanciar `eaasSDK()` en cada componente.

   Ejemplo `src/sdk.ts` (o `src/lib/sdk.ts`):
   ```ts
   import eaasSDK from "@sfdc/eaas/sdk";

   export const sdk = eaasSDK({
     baseUrl: import.meta.env.VITE_SDK_BASE_URL,
     clientId: import.meta.env.VITE_SDK_CLIENT_ID,
     clientSecret: import.meta.env.VITE_SDK_CLIENT_SECRET,
     useMockData: import.meta.env.VITE_SDK_USE_MOCKS === "true",
   });
   ```

   En componentes/páginas: `import { sdk } from "../sdk";` y usar `sdk.taxonomy.*`, `sdk.agentforce.*`, `sdk.data360.*`, `sdk.estimations.*`.

**Resumen de pasos (tarball):**

| Paso | Acción |
|------|--------|
| 1 | Copiar `sfdc-eaas-0.3.0.tgz` al proyecto (p. ej. en `sdk/`). |
| 2 | En `package.json`: `"@sfdc/eaas": "file:sdk/sfdc-eaas-0.3.0.tgz"` y ejecutar `npm install`. |
| 3 | Crear `.env` con `VITE_SDK_BASE_URL`, `VITE_SDK_CLIENT_ID`, `VITE_SDK_CLIENT_SECRET` (y opcionalmente `VITE_SDK_USE_MOCKS`). |
| 4 | Crear módulo `src/sdk.ts` que exporte la instancia (ver paso 5 arriba). |
| 5 | Importar `{ sdk }` donde haga falta; para `EstimationConfig` / `EstimationConfigItem` definir tipos locales (ver §4). |

---

## 1. Dependencia e inicialización

**Config obligatoria:** `baseUrl`, `clientId`, `clientSecret`. El SDK envía `client_id` y `client_secret` como headers. Import: `@sfdc/eaas/sdk` o `@sfdc/eaas` (mismo entry).

```ts
import eaasSDK from "@sfdc/eaas/sdk";

const sdk = eaasSDK({
  baseUrl: "https://{env}.mule-api-gateway.com",
  clientId: process.env.VITE_SDK_CLIENT_ID,
  clientSecret: process.env.VITE_SDK_CLIENT_SECRET,
  useMockData: import.meta.env.VITE_SDK_USE_MOCKS === "true",
  // Opcionales: httpClient, logger, providers
});
```

**Config opcional:** `useMockData?: boolean` — activa datos mock para desarrollo/testing.

**Regla:** Una sola instancia de SDK por app (o por contexto server en SSR) para reutilizar la caché interna de config. Por defecto el transporte es `fetch`; se puede inyectar otro `httpClient` (o `logger`) vía config.

---

## 2. Superficie de la API (sdk.*)

| Servicio | Uso principal |
|----------|----------------|
| **sdk.taxonomy** | Industrias, tamaños de empresa, clouds, settings (CREDITS_X_ACTIONS, SKU_CREDIT_VALUE). |
| **sdk.agentforce** | Templates → Topics (casos de uso), créditos/precio por topic con inputs, ítems de config para estimación. |
| **sdk.data360** | Data Foundation inputs, Use Cases — para estimaciones con Data 360. |
| **sdk.estimations** | Crear/actualizar/compartir estimaciones; config viene de taxonomy + agentforce + data360. |

Templates y topics se sirven desde la caché del SDK (una carga, luego reutilizada).

### Métodos por servicio (lista completa)

- **sdk.taxonomy:** `getIndustries()`, `getCompanySizes()`, `getClouds()`, `getSettingByKey(key)` — settings para cálculos internos o avanzados.
- **sdk.agentforce:** `getTemplates()`, `getTopicsByTemplate(templateId)`, `getTopicById(templateId, topicId)`, `getActionCountByTopic(topic)`, `getTotalActionsByTopic(templateId, topicId, inputValues?)`, `getTotalCreditsByTopic(...)`, `getTotalPriceByTopic(...)`, `createEstimationConfigItem(template, currency)`, `updateEstimationConfigItemTopicValues(configItem, topicId, selected, inputValues)`.
- **sdk.data360:** `getDataFoundationInputs()`, `getUseCases()` — datos para configurar estimaciones Data 360.
- **sdk.estimations:** `createEstimation(body)`, `updateEstimation(estimation)`, `shareEstimation(estimation)`, `getConfigs(acceptLanguage?)` — `getConfigs` normalmente no se llama directo (lo usa la caché interna); default `acceptLanguage` es `"en-US"`.

---

## 3. Flujos de uso

### 3.1 Selectores (taxonomía)

```ts
const [industries, companySizes] = await Promise.all([
  sdk.taxonomy.getIndustries(),
  sdk.taxonomy.getCompanySizes(),
]);
// industryId / companySizeId para crear estimación o filtros UI
```

### 3.2 Calculadora (templates → topics → créditos/precio)

```ts
const templates = await sdk.agentforce.getTemplates();
const topics = await sdk.agentforce.getTopicsByTemplate(templateId);

const inputValues: EstimationInputValue[] = [
  { inputKey: "numberOfUsers", value: 10 },
];

const [credits, price] = await Promise.all([
  sdk.agentforce.getTotalCreditsByTopic(templateId, topicId, inputValues),
  sdk.agentforce.getTotalPriceByTopic(templateId, topicId, inputValues),
]);
```

### 3.3 Crear estimación y añadir Agentforce

```ts
// 1. Crear estimación (industry + company size). Devuelve estimación mínima (id, industryId, companySizeId); config se añade después.
const estimation = await sdk.estimations.createEstimation({
  industryId: selectedIndustryId,
  companySizeId: selectedCompanySizeId,
});

// 2. Crear ítem de config Agentforce para un template
const template = templates.find((t) => t.id === templateId);
const agentforceItem = await sdk.agentforce.createEstimationConfigItem(template, "USD");

// 3. Cuando el usuario cambia topic o inputs (updated reemplaza el config item en estado):
const updatedItem = await sdk.agentforce.updateEstimationConfigItemTopicValues(
  agentforceItem,
  topicId,
  selected,
  inputValues
);

// 4. Montar config y actualizar estimación (el SDK recalcula totalCredits/totalPrice)
const newConfig = estimation.config ? [...estimation.config] : [];
const agentforceBlock = newConfig.find((c) => c.product === "agentforce");
if (!agentforceBlock) {
  newConfig.push({ product: "agentforce", config: [updatedItem] });
} else {
  agentforceBlock.config.push(updatedItem); // o reemplazar el ítem correspondiente
}

const updated = await sdk.estimations.updateEstimation({
  ...estimation,
  config: newConfig,
});
// updated.totalCredits, updated.totalPrice ya vienen calculados
```

### 3.4 Compartir estimación

```ts
await sdk.estimations.shareEstimation(estimation); // Promise<void>, sin body de respuesta
```

### 3.5 Data360 (flujo básico)

```ts
const [dataFoundationInputs, useCases] = await Promise.all([
  sdk.data360.getDataFoundationInputs(),
  sdk.data360.getUseCases(),
]);
// dataFoundationInputs: Data360.DataFoundationInput[] (id, label)
// useCases: Data360.UseCase[] (id, title, inputs: UseCaseInput[])
// Para añadir Data360 a la estimación: config con product: "data360" y config: Data360.EstimationConfigItem[]
```

### 3.6 Comportamientos útiles

- `getTopicsByTemplate(templateId)` devuelve `[]` si el template no existe.
- `getTopicById(templateId, topicId)` devuelve `undefined` si no encuentra el topic.
- `getTotalCreditsByTopic` / `getTotalPriceByTopic` lanzan si falta el topic o el setting de taxonomía (CREDITS_X_ACTIONS, SKU_CREDIT_VALUE).
- Créditos = total actions × CREDITS_X_ACTIONS; precio = créditos × SKU_CREDIT_VALUE (el SDK lo aplica internamente).

---

## 4. Tipos clave para tipar en la otra app

- **SDKConfig:** `{ baseUrl, clientId, clientSecret, useMockData?, httpClient?, logger?, providers? }` — opcionales: `useMockData` para mocks, `SDKProviders`.
- **EstimationCreateRequest:** `{ industryId: string; companySizeId: string }`
- **Estimation:** `id`, `industryId`, `companySizeId`, `step?`, `totalCredits?`, `totalPrice?`, `totalPriceCurrency?`, `isDownloaded?`, `isSpecialistContacted?`, `config?: EstimationConfig[]`. Totales los setea `updateEstimation`.
- **Estimation.config[]:** cada elemento `{ product: string (ej. "agentforce", "data360"), config: EstimationConfigItem[] }`. **Nota:** `EstimationConfig` y `EstimationConfigItem` no se exportan desde el entry principal del paquete (`@sfdc/eaas/sdk`). En la otra app hay que definirlos localmente según las formas descritas aquí (o usar `Agentforce.EstimationConfigItem` / `Data360.EstimationConfigItem` que sí se exportan). Ejemplo de definición local:

  ```ts
  import type { Agentforce } from "@sfdc/eaas/sdk";

  export type EstimationConfigItem = Agentforce.EstimationConfigItem;
  export type EstimationConfig = {
    product: string;
    config: EstimationConfigItem[];
  };
  ```
- **Agentforce.Template:** `id`, `systemName`, `displayName`, `description?`, `topics`, etc.
- **Agentforce.Topic:** `id`, `formula` (placeholders `{inputKey}`), `inputs?` (TopicInput[]), `metadata?.actionCount`, `minimumCredits`, `maximumCredits`, `mostLikelyCredits`
- **Agentforce.TopicInput:** `key`, `label`, `dataType` (NUMBER, PERCENTAGE…), `config?` (min, max, default)
- **EstimationInputValue / Agentforce.TopicInputValue:** `{ inputKey: string; value: number }` — `inputKey` coincide con `TopicInput.key`. El SDK exporta `EstimationInputValue`; `TopicInputValue` puede ser un alias. Usar `value` (no `inputValue`).
- **Agentforce.TopicEstimationConfig:** `topicId`, `selected?`, `inputs` (TopicInputValue[]), `actionsQuantity?`, `totalActions?`, `credits`, `price`
- **Agentforce.EstimationConfigItem:** `templateId`, `credits`, `price`, `totalPriceCurrency`, `topics: TopicEstimationConfig[]`. `createEstimationConfigItem` crea un entry por topic con `selected: false` e inputs por defecto.
- **Taxonomy.Industry:** `id`, `systemName`, `displayName`, `description?`, `icon?`
- **Taxonomy.CompanySize:** `id`, `systemName`, `displayName`, `description?`, `sizeDetails` (ej. rango numérico)
- **Taxonomy.SettingItem:** `key`, `name`, `value` — ej. CREDITS_X_ACTIONS, SKU_CREDIT_VALUE
- **Taxonomy.Cloud:** `id`, `displayName`, `description?`
- **Data360.DataFoundationInput:** `id`, `label`
- **Data360.UseCase:** `id`, `title`, `inputs: UseCaseInput[]`
- **Data360.UseCaseInput:** `id`, `label`, `config?` (objeto con min, max, default, etc.)
- **Data360.EstimationConfigItem:** estructura para config Data 360 en `Estimation.config`

Import de tipos (si el paquete los exporta):

```ts
import type { EaaSClientSDK, SDKConfig, Estimation, EstimationCreateRequest, EstimationInputValue } from "@sfdc/eaas/sdk";
import type { Agentforce, Taxonomy, Data360 } from "@sfdc/eaas/sdk";
```

---

## 5. SSR (ej. Nuxt): secretos solo en server

- Crear el SDK solo en server (p. ej. `server/utils/sdk.ts`) usando `useRuntimeConfig()` o `process.env`.
- Validar config antes de crear el SDK: si faltan `sdkBaseUrl`, `sdkClientId` o `sdkClientSecret`, lanzar error claro para no exponer el SDK a medio configurar.
- Exponer la instancia vía plugin (`provide: { sdk }`) solo en server (ej. `plugins/sdk.server.ts`).
- En páginas: `const { $sdk } = useNuxtApp();` y llamar `$sdk.agentforce.*`, `$sdk.data360.*`, `$sdk.estimations.*`, etc. La caché queda dentro del SDK; el cliente nunca toca `baseUrl` ni credenciales. Usar `useAsyncData(..., { server: true })` para datos server-side.

---

## 6. Checklist para integrar en otra app

1. Instalar `@sfdc/eaas` y crear una sola instancia con `eaasSDK(config)`.
2. Cargar taxonomía (`getIndustries`, `getCompanySizes`) para selects/filtros.
3. Para calculadora: `getTemplates` → `getTopicsByTemplate` → `getTotalCreditsByTopic` / `getTotalPriceByTopic` con `EstimationInputValue[]` (`{ inputKey, value }`).
4. Para estimación: `createEstimation` → opcionalmente `createEstimationConfigItem` + `updateEstimationConfigItemTopicValues` → armar `config` → `updateEstimation`.
5. Si hay compartir: `shareEstimation(estimation)`.
6. En SSR, no instanciar el SDK en el cliente; inyectar la instancia server-side.
7. Si necesitas clouds para filtros/UI: `sdk.taxonomy.getClouds()`. Para un setting concreto: `sdk.taxonomy.getSettingByKey(key)`.
8. Para un solo topic: `sdk.agentforce.getTopicById(templateId, topicId)`. Para acciones sin convertir a créditos: `sdk.agentforce.getTotalActionsByTopic(templateId, topicId, inputValues?)`.
9. Para Data360: `sdk.data360.getDataFoundationInputs()`, `sdk.data360.getUseCases()`; añadir `product: "data360"` al config cuando aplique.

Referencia detallada: [api-reference.md](api-reference.md), [estimations.md](estimations.md), [agentforce.md](agentforce.md), [taxonomy.md](taxonomy.md).