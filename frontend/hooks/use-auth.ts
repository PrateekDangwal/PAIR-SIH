'use client';
import {useContext} from 'react';
import {AuthContext} from '@/components/providers';
export function useAuth(){const c=useContext(AuthContext);if(!c)throw new Error('useAuth must be used within Providers');return c;}
