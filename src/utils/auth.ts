const TokenKey: string = 'AT';

const tokenStorage = useStorage<null | string>(TokenKey, null);

export const getToken = () => tokenStorage.value;

export const setToken = (access_token: string) => (tokenStorage.value = access_token);

export const removeToken = () => (tokenStorage.value = null);

const ShopTokenKey: string = 'ST';

const shopTokenStorage = useStorage<null | string>(ShopTokenKey, null);

export const getShopToken = () => shopTokenStorage.value;

export const setShopToken = (token: string) => (shopTokenStorage.value = token);

export const removeShopToken = () => (shopTokenStorage.value = null);

const ShopAdminTokenKey: string = 'SAT';

const shopAdminTokenStorage = useStorage<null | string>(ShopAdminTokenKey, null);

export const getAdminShopToken = () => shopAdminTokenStorage.value;

export const setAdminShopToken = (token: string) => (shopAdminTokenStorage.value = token);

export const removeAdminShopToken = () => (shopAdminTokenStorage.value = null);
