import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import config from '../config.json';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

const ADMIN_EMAILS = ['ndemartis@fcecon.unr.edu.ar', 'elcibernico@gmail.com'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [simulatedRole, setSimulatedRole] = useState(null); // 'invitado' | 'revisor' | 'admin' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchOrCreateProfile(session.user);
        await fetchUserPermissions(session.user.email);
      } else {
        setUser(null);
        setProfile(null);
        setPermissions([]);
        setUserPermissions([]);
        setSimulatedRole(null);
      }
      setLoading(false);
    });

    // Cargar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchOrCreateProfile(session.user);
        fetchUserPermissions(session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Cargar matriz de permisos de Supabase
    fetchPermissions();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPermissions = async () => {
    // Load from localStorage as initial fallback
    const cached = localStorage.getItem('dialitico_role_permissions');
    if (cached) {
      try { setPermissions(JSON.parse(cached)); } catch(e) {}
    }
    try {
      const { data, error } = await supabase
        .from('dialitico_role_permissions')
        .select('*');
      if (!error && data) {
        setPermissions(data);
        localStorage.setItem('dialitico_role_permissions', JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Tabla dialitico_role_permissions no accesible aún, usando fallback:', err);
    }
  };

  const fetchUserPermissions = async (email) => {
    if (!email) return;
    const cached = localStorage.getItem(`dialitico_user_permissions_${email}`);
    if (cached) {
      try { setUserPermissions(JSON.parse(cached)); } catch(e) {}
    }
    try {
      const { data, error } = await supabase
        .from('dialitico_user_permissions')
        .select('*')
        .eq('user_email', email);
      if (!error && data) {
        setUserPermissions(data);
        localStorage.setItem(`dialitico_user_permissions_${email}`, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Tabla dialitico_user_permissions no accesible:', err);
    }
  };

  const fetchOrCreateProfile = async (currentUser) => {
    try {
      const now = new Date().toISOString();
      // El Trigger en BD ya se encarga de crearlo si no existe, solo actualizamos last_login
      let { data, error } = await supabase
        .from('dialitico_user_profiles')
        .update({ last_login: now })
        .eq('email', currentUser.email)
        .select()
        .single();
        
      if (error || !data) {
        // Fallback local preventivo si el trigger tarda unos ms
        const isRealAdmin = ADMIN_EMAILS.includes(currentUser.email);
        data = {
          email: currentUser.email,
          nombre: currentUser.user_metadata?.full_name || currentUser.email.split('@')[0],
          organizacion: '',
          role: isRealAdmin ? 'admin' : 'invitado',
          is_active: true,
          last_login: now
        };
      }
      setProfile(data);
    } catch (err) {
      console.error('Error cargando perfil:', err);
    }
  };

  const isRealAdmin = user && (ADMIN_EMAILS.includes(user.email) || profile?.role === 'admin');

  // Función de evaluación de permisos con herencia implícita, sobreescrituras de usuario y mapeo automático de bloques
  const hasPermission = (nodeId) => {
    if (!nodeId) return true;

    const findAncestors = (targetId, nodes = config.blocks) => {
      for (let node of nodes) {
        if (node.id === targetId) return [];
        if (node.children || node.sections) {
          const children = node.children || node.sections;
          const childPath = findAncestors(targetId, children);
          if (childPath !== null) {
            return [node.id, ...childPath];
          }
        }
      }
      return null;
    };

    // Normalizar nodeId (mapear bloques y secciones a Puntos)
    const mapNodeId = (id) => {
      const mapping = {
        'p1': ['p1_p1', 'p1_p2', 'p1_p3', 'p1_p4', 'p1_p5'],
        'p2': ['p2_p1', 'p2_p2'],
        'p3': ['p3_p1', 'p3_p2', 'p3_p3', 'p3_p4', 'p3_p5'],
        'b1_actuarial': ['p1_p1', 'p1_p2', 'p1_p3', 'p1_p4', 'p1_p5'],
        'b2_quiebre': ['p2_p1', 'p2_p2'],
        'b3_econometria': ['p3_p1', 'p3_p2', 'p3_p3', 'p3_p4', 'p3_p5'],
        's1_intro': ['p1_p1'],
        's2_limitaciones': ['p1_p2'],
        's3_solucion': ['p1_p3'],
        's4_tabla': ['p1_p4'],
        's5_ajustes': ['p1_p5'],
        's6_quiebre': ['p2_p1'],
        's7_retrospectivo': ['p3_p1'],
        's7_motor': ['p3_p1'],
        's8_regresion': ['p3_p2'],
        's9_impacto': ['p3_p3'],
        's10_prospectivo': ['p3_p4'],
        's11_valor_tecnico': ['p3_p5']
      };
      return mapping[id] || [id];
    };

    const targetNodes = mapNodeId(nodeId);

    // Rol activo para evaluación
    const effectiveRole = (isRealAdmin && simulatedRole) 
      ? simulatedRole 
      : (isRealAdmin ? 'admin' : (profile?.role || 'invitado'));

    // Si el rol efectivo es admin, tiene acceso total
    if (effectiveRole === 'admin') return true;

    // Auxiliar para evaluar un nodo simple
    const checkSingleNode = (singleNodeId) => {
      const ancestors = findAncestors(singleNodeId) || [];
      const path = [singleNodeId, ...ancestors.reverse()];

      // 0. Si NO estamos en simulación, verificar primero overrides del usuario
      if (!(isRealAdmin && simulatedRole) && user?.email) {
        const userSpecificRules = userPermissions.filter(p => p.user_email === user.email);
        if (userSpecificRules.length > 0) {
          // Si hay algún DENY explícito en el camino, denegar
          const hasExplicitDeny = path.some(id => {
            const match = userSpecificRules.find(p => p.node_id === id);
            return match !== undefined && !match.has_access;
          });
          if (hasExplicitDeny) return false;

          // Si hay algún ALLOW explícito en el camino, permitir
          const hasExplicitAllow = path.some(id => {
            const match = userSpecificRules.find(p => p.node_id === id);
            return match !== undefined && match.has_access;
          });
          if (hasExplicitAllow) return true;
        }
      }

      // 1. Evaluar por Rol (RBAC)
      const roleRules = permissions.filter(p => p.role === effectiveRole);
      if (roleRules.length > 0) {
        // Si hay algún DENY explícito en el camino, denegar
        const hasExplicitDeny = path.some(id => {
          const match = roleRules.find(p => p.node_id === id);
          return match !== undefined && !match.has_access;
        });
        if (hasExplicitDeny) return false;

        // Si hay algún ALLOW explícito en el camino, permitir
        const hasExplicitAllow = path.some(id => {
          const match = roleRules.find(p => p.node_id === id);
          return match !== undefined && match.has_access;
        });
        if (hasExplicitAllow) return true;
      }

      // Fallbacks por defecto:
      if (effectiveRole === 'revisor') return true;
      if (effectiveRole === 'invitado') {
        const allowedNodes = ['p1_p1', 'p1_p2', 'p2_p1'];
        const isAllowedByDefault = path.some(id => allowedNodes.includes(id));
        return isAllowedByDefault;
      }
      return false;
    };

    // Si coincide con al menos uno de los targetNodes, tiene acceso
    return targetNodes.some(node => checkSingleNode(node));
  };

  const loginWithProvider = async (provider) => {
    const redirectUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5173'
      : 'https://paridad-arancel-dialitico.vercel.app/';

    let supabaseProvider = provider;
    if (provider === 'microsoft') {
      supabaseProvider = 'azure';
    } else if (provider === 'yahoo') {
      supabaseProvider = 'custom:yahoo';
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: supabaseProvider,
      options: { redirectTo: redirectUrl }
    });
    if (error) throw error;
  };

  const loginWithMagicLink = async (email) => {
    const redirectUrl = window.location.origin.includes('localhost')
      ? 'http://localhost:5173'
      : 'https://paridad-arancel-dialitico.vercel.app/';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl }
    });
    if (error) throw error;
  };

  const logout = async () => {
    try {
      setSimulatedRole(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Error signing out of Supabase, forcing local logout:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setPermissions([]);
      setUserPermissions([]);
      setSimulatedRole(null);
    }
  };

  const updateRolePermissionsMultiple = async (role, updates) => {
    setPermissions(prev => {
      let updated = [...prev];
      updates.forEach(u => {
        updated = [...updated.filter(p => !(p.role === role && p.node_id === u.nodeId)), { role, node_id: u.nodeId, has_access: u.hasAccess }];
      });
      localStorage.setItem('dialitico_role_permissions', JSON.stringify(updated));
      return updated;
    });

    try {
      const rows = updates.map(u => ({ role, node_id: u.nodeId, has_access: u.hasAccess }));
      const uniqueRows = [];
      const seen = new Set();
      for (const row of rows) {
        if (!seen.has(row.node_id)) {
          seen.add(row.node_id);
          uniqueRows.push(row);
        }
      }
      const { error } = await supabase
        .from('dialitico_role_permissions')
        .upsert(uniqueRows, { onConflict: 'role,node_id' });
      if (error) console.error('Error actualizando permisos de rol en lote:', error);
    } catch (err) {
      console.warn('Error al escribir roles en Supabase en lote (usando cache local):', err);
    }
  };

  const updateRolePermission = async (role, nodeId, hasAccess) => {
    await updateRolePermissionsMultiple(role, [{ nodeId, hasAccess }]);
  };

  const updateUserPermissionsMultiple = async (email, updates) => {
    setUserPermissions(prev => {
      let updated = [...prev];
      updates.forEach(u => {
        updated = updated.filter(p => !(p.user_email === email && p.node_id === u.nodeId));
        if (u.status !== 'heredar') {
          updated.push({ user_email: email, node_id: u.nodeId, has_access: u.status === 'permitir' });
        }
      });
      localStorage.setItem(`dialitico_user_permissions_${email}`, JSON.stringify(updated));
      return updated;
    });

    try {
      const toDelete = [...new Set(updates.filter(u => u.status === 'heredar').map(u => u.nodeId))];
      const toUpsertRaw = updates.filter(u => u.status !== 'heredar').map(u => ({
        user_email: email,
        node_id: u.nodeId,
        has_access: u.status === 'permitir'
      }));
      
      const toUpsert = [];
      const seen = new Set();
      for (const row of toUpsertRaw) {
        if (!seen.has(row.node_id)) {
          seen.add(row.node_id);
          toUpsert.push(row);
        }
      }

      if (toDelete.length > 0) {
        const { error } = await supabase
          .from('dialitico_user_permissions')
          .delete()
          .eq('user_email', email)
          .in('node_id', toDelete);
        if (error) console.error('Error eliminando permisos individuales en lote:', error);
      }

      if (toUpsert.length > 0) {
        const { error } = await supabase
          .from('dialitico_user_permissions')
          .upsert(toUpsert, { onConflict: 'user_email,node_id' });
        if (error) console.error('Error actualizando permisos individuales en lote:', error);
      }
    } catch (err) {
      console.warn('Error al escribir permisos individuales en Supabase (usando cache local):', err);
    }
  };

  const updateUserPermission = async (email, nodeId, status) => {
    await updateUserPermissionsMultiple(email, [{ nodeId, status }]);
  };

  const refreshPermissions = () => {
    fetchPermissions();
    if (user?.email) {
      fetchUserPermissions(user.email);
    }
  };

  const value = {
    user,
    profile,
    permissions,
    userPermissions,
    simulatedRole,
    setSimulatedRole: (role) => {
      if (isRealAdmin) {
        setSimulatedRole(role);
      }
    },
    isRealAdmin,
    hasPermission,
    refreshPermissions,
    updateRolePermission,
    updateUserPermission,
    updateRolePermissionsMultiple,
    updateUserPermissionsMultiple,
    refreshUserPermissions: () => {
      if (user?.email) fetchUserPermissions(user.email);
    },
    loading,
    loginWithProvider,
    loginWithMagicLink,
    logout,
    supabase
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
