const tokenKey = 'authToken';

type TokenChangeListener = (newToken: string | null) => void;
const tokenChangeListeners: TokenChangeListener[] = [];

export const onTokenChange = (listener: TokenChangeListener): void => {
    tokenChangeListeners.push(listener);
};

const emitTokenChange = (token: string | null) => {
    tokenChangeListeners.forEach(listener => listener(token));
};

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(tokenKey);
    return token ?? null;
};

export const setToken = (value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(tokenKey, value);
    emitTokenChange(value);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(tokenKey);
    emitTokenChange(null);
};

export const GetJwtPayload = (token: string): any => {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    try {
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT payload:', error);
        return null;
    }
};

export const getUserdata = (): any => {
    const token = getToken();
    if (!token) return null;
    const payload = GetJwtPayload(token);
    if (!payload) return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) {
        removeToken();
        return null;
    }
    return {
        id: payload.sub,
        name: payload.name
    };
};
