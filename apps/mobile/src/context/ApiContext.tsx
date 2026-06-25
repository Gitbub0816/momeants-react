import React, { createContext, useContext } from 'react';
import { MockMomentsApi } from '@momeants/api';
import type { MomentsApi } from '@momeants/types';

const api = new MockMomentsApi();
const ApiContext = createContext<MomentsApi>(api);

export function ApiProvider({ children }: { children: React.ReactNode }) {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): MomentsApi {
  return useContext(ApiContext);
}
