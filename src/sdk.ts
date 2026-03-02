import eaasSDK from '@sfdc/eaas/sdk';

export const sdk = eaasSDK({
	baseUrl: import.meta.env.VITE_SDK_BASE_URL,
	clientId: import.meta.env.VITE_SDK_CLIENT_ID,
	clientSecret: import.meta.env.VITE_SDK_CLIENT_SECRET,
	useMockData: import.meta.env.VITE_SDK_USE_MOCKS === "true",
});
