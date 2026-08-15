import React, { useState, useEffect } from 'react';
import { useAuth, supabase } from '../context/AuthContext';
import config from '../config.json';
import { ChevronDown, ChevronRight, Check, Users, Shield, Plus, ArrowLeft, Eye, Clock, X } from 'lucide-react';

const HIERARCHY_TREE = config.blocks.map(block => ({
  id: block.id,
  title: block.title,
  type: block.type || 'parte',
  children: (block.sections || []).map(sec => ({
    id: sec.id,
    title: sec.title,
    type: sec.type || 'punto',
    component: sec.component || null,
    children: sec.children || []
  }))
}));


export default function AdminPanel({ onBack }) {
  const { 
    user, 
    isRealAdmin, 
    simulatedRole, 
    setSimulatedRole, 
    permissions, 
    refreshPermissions, 
    updateRolePermission, 
    updateUserPermission,
    updateRolePermissionsMultiple,
    updateUserPermissionsMultiple
  } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('');
  const [newUserRole, setNewUserRole] = useState('invitado');

  // Nodos expandidos en la Matriz de Permisos Jerárquica
  const [expandedNodes, setExpandedNodes] = useState({ p1: true, p2: true, p3: true });

  // Estados para la configuración de permisos individuales por usuario
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState([]);

  // Si no es admin real, denegar acceso
  if (!user || !isRealAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-sm text-slate-500 mt-2">Solo cuentas administradoras autenticadas pueden acceder al panel.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('dialitico_user_profiles')
        .select('*');

      if (!error && data) {
        setUsuarios(data);
      } else {
        setUsuarios([
          { email: 'ndemartis@fcecon.unr.edu.ar', nombre: 'Pablo Nicolás Demartis', organizacion: 'UNR', role: 'admin', is_active: true, last_login: new Date().toISOString() },
          { email: 'elcibernico@gmail.com', nombre: 'Revisor Técnico', organizacion: 'Estudio Contable', role: 'admin', is_active: true, last_login: new Date().toISOString() }
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserPermissionsForAdmin = async (email) => {
    try {
      const { data, error } = await supabase
        .from('dialitico_user_permissions')
        .select('*')
        .eq('user_email', email);
      if (!error && data) {
        setSelectedUserPermissions(data);
      } else {
        // Fallback optimistic offline load
        const cached = localStorage.getItem(`dialitico_user_permissions_${email}`);
        if (cached) {
          setSelectedUserPermissions(JSON.parse(cached));
        } else {
          setSelectedUserPermissions([]);
        }
      }
    } catch (err) {
      console.error(err);
      const cached = localStorage.getItem(`dialitico_user_permissions_${email}`);
      if (cached) {
        setSelectedUserPermissions(JSON.parse(cached));
      } else {
        setSelectedUserPermissions([]);
      }
    }
  };

  const handleOpenUserPermissions = (u) => {
    setSelectedUser(u);
    fetchUserPermissionsForAdmin(u.email);
  };

  const handleToggleUserPermission = async (email, nodeId, status) => {
    const updates = [{ nodeId, status }];
    
    const descendants = findDescendants(nodeId);
    descendants.forEach(descId => {
      updates.push({ nodeId: descId, status });
    });
    
    if (status === 'permitir') {
      const ancestors = findAncestors(nodeId);
      ancestors.forEach(ancId => {
        updates.push({ nodeId: ancId, status: 'permitir' });
      });
    }
    
    await updateUserPermissionsMultiple(email, updates);
    fetchUserPermissionsForAdmin(email);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserEmail) return;

    const nuevo = {
      email: newUserEmail,
      nombre: newUserName || newUserEmail.split('@')[0],
      organizacion: newUserOrg,
      role: newUserRole,
      is_active: true,
      last_login: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('dialitico_user_profiles')
        .insert([nuevo]);

      if (!error) {
        fetchUsers();
        setNewUserEmail('');
        setNewUserName('');
        setNewUserOrg('');
      } else {
        setUsuarios(prev => [...prev, nuevo]);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserOrg('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleUserActive = async (email, currentStatus) => {
    try {
      const { error } = await supabase
        .from('dialitico_user_profiles')
        .update({ is_active: !currentStatus })
        .eq('email', email);

      if (!error) {
        fetchUsers();
      } else {
        setUsuarios(prev => prev.map(u => u.email === email ? { ...u, is_active: !currentStatus } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeUserRole = async (email, newRole) => {
    try {
      const { error } = await supabase
        .from('dialitico_user_profiles')
        .update({ role: newRole })
        .eq('email', email);

      if (!error) {
        fetchUsers();
      } else {
        setUsuarios(prev => prev.map(u => u.email === email ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const findDescendants = (nodeId) => {
    const list = [];
    const traverse = (node) => {
      if (node.id === nodeId) {
        const collect = (n) => {
          list.push(n.id);
          if (n.children) n.children.forEach(collect);
        };
        if (node.children) node.children.forEach(collect);
        return true;
      }
      if (node.children) {
        for (let child of node.children) {
          if (traverse(child)) return true;
        }
      }
      return false;
    };

    HIERARCHY_TREE.forEach(traverse);
    return list;
  };

  const findAncestors = (nodeId) => {
    const path = [];
    const traverse = (node, currentPath) => {
      if (node.id === nodeId) {
        path.push(...currentPath);
        return true;
      }
      if (node.children) {
        for (let child of node.children) {
          if (traverse(child, [...currentPath, node.id])) return true;
        }
      }
      return false;
    };
    HIERARCHY_TREE.forEach(block => traverse(block, []));
    return path;
  };

  const toggleExpand = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const getPermission = (role, nodeId) => {
    if (role === 'admin') return true;

    // Construir camino desde el nodo hasta la raíz
    const path = [nodeId, ...findAncestors(nodeId).reverse()];
    
    // Buscar la primera regla explícita en la jerarquía (de hijo a padre)
    for (let id of path) {
      const rule = permissions.find(p => p.role === role && p.node_id === id);
      if (rule !== undefined) {
        return rule.has_access;
      }
    }

    // Fallbacks por defecto
    if (role === 'revisor') return true;
    if (role === 'invitado') {
      const allowed = ['p1_p1', 'p1_p2', 'p2_p1', 'p1_p1_a1', 'p1_p1_a2', 'p1_p2_a1', 'p2_p1'];
      return path.some(id => allowed.includes(id));
    }
    return false;
  };

  const handleTogglePermission = async (role, nodeId, currentVal) => {
    if (role === 'admin') return;
    const newVal = !currentVal;
    
    const updates = [{ nodeId, hasAccess: newVal }];
    
    const descendants = findDescendants(nodeId);
    descendants.forEach(descId => {
      updates.push({ nodeId: descId, hasAccess: newVal });
    });

    if (newVal) {
      const ancestors = findAncestors(nodeId);
      ancestors.forEach(ancId => {
        updates.push({ nodeId: ancId, hasAccess: true });
      });
    }

    await updateRolePermissionsMultiple(role, updates);
  };

  const formatLastLogin = (isoString) => {
    if (!isoString) return 'Nunca';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return 'Sin registro';
    }
  };

  const renderTreeNodes = (nodes, depth = 0) => {
    return nodes.map(node => {
      const isExpanded = !!expandedNodes[node.id];
      const hasChildren = node.children && node.children.length > 0;
      
      const invVal = getPermission('invitado', node.id);
      const revVal = getPermission('revisor', node.id);

      let indentClass = "";
      if (depth === 1) indentClass = "pl-5 sm:pl-7";
      else if (depth === 2) indentClass = "pl-10 sm:pl-12";
      else if (depth === 3) indentClass = "pl-14 sm:pl-16";
      else if (depth === 4) indentClass = "pl-18 sm:pl-20";

      let typeLabel = "";
      let titleStyle = "text-slate-300 font-medium";
      let bgStyle = "bg-slate-900/10";
      let borderStyle = "border-slate-850/60";

      if (node.type === 'parte') {
        typeLabel = "PARTE";
        titleStyle = "text-teal-400 font-extrabold text-xs sm:text-sm";
        bgStyle = "bg-slate-900/40";
        borderStyle = "border-slate-800";
      } else if (node.type === 'punto') {
        typeLabel = "PUNTO";
        titleStyle = "text-slate-200 font-bold text-xs sm:text-sm";
        bgStyle = "bg-slate-900/20";
        borderStyle = "border-slate-850";
      } else if (node.type === 'apartado') {
        typeLabel = "APARTADO";
        titleStyle = "text-violet-300 font-semibold text-xs";
        bgStyle = "bg-slate-900/10";
        borderStyle = "border-slate-850/40";
      } else if (node.type === 'bloque') {
        typeLabel = "BLOQUE";
        titleStyle = "text-amber-300/90 font-medium text-[11px] sm:text-xs";
        bgStyle = "bg-slate-950/20";
        borderStyle = "border-slate-850/30";
      } else if (node.type === 'desarrollo') {
        typeLabel = "DESARROLLO";
        titleStyle = "text-rose-300 font-normal text-[11px] sm:text-xs italic";
        bgStyle = "bg-slate-950/40";
        borderStyle = "border-slate-850/20";
      }

      return (
        <div key={node.id} className={`${bgStyle} border-b ${borderStyle}`}>
          <div className={`p-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-900/40 ${indentClass}`}>
            <div className="col-span-6 sm:col-span-7 flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white focus:outline-none"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <span className={`text-[8px] sm:text-[9px] px-1 py-0.5 rounded font-black tracking-wider uppercase bg-slate-850 text-slate-400 mr-1`}>
                {typeLabel}
              </span>
              <span className={titleStyle}>{node.title}</span>
            </div>

            {/* CHECKBOX INVITADO */}
            <div className="col-span-2 text-center">
              <input
                type="checkbox"
                checked={invVal}
                onChange={() => handleTogglePermission('invitado', node.id, invVal)}
                className="w-4.5 h-4.5 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            {/* CHECKBOX REVISOR */}
            <div className="col-span-2 text-center">
              <input
                type="checkbox"
                checked={revVal}
                onChange={() => handleTogglePermission('revisor', node.id, revVal)}
                className="w-4.5 h-4.5 accent-teal-500 rounded cursor-pointer"
              />
            </div>

            {/* CHECKBOX ADMIN */}
            <div className="col-span-2 sm:col-span-1 text-center">
              <Check className="w-4.5 h-4.5 text-emerald-400 mx-auto opacity-70" />
            </div>
          </div>

          {/* Children */}
          {hasChildren && isExpanded && (
            <div className="divide-y divide-slate-850/40">
              {renderTreeNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  const renderUserPermissionNodes = (nodes, depth = 0) => {
    return nodes.map(node => {
      const isExpanded = !!expandedNodes[node.id];
      const hasChildren = node.children && node.children.length > 0;
      
      const override = selectedUserPermissions.find(o => o.node_id === node.id);
      const mode = override === undefined ? 'heredar' : (override.has_access ? 'permitir' : 'denegar');

      const inheritedAccess = getPermission(selectedUser.role, node.id);

      let indentClass = "";
      if (depth === 1) indentClass = "pl-4 sm:pl-6";
      else if (depth === 2) indentClass = "pl-8 sm:pl-10";
      else if (depth === 3) indentClass = "pl-12 sm:pl-14";
      else if (depth === 4) indentClass = "pl-16 sm:pl-20";

      let typeLabel = "";
      let titleStyle = "text-slate-300 font-medium";
      let bgStyle = "bg-slate-900/10";
      let borderStyle = "border-slate-850/60";

      if (node.type === 'parte') {
        typeLabel = "PARTE";
        titleStyle = "text-teal-400 font-bold text-xs";
        bgStyle = "bg-slate-900/30";
      } else if (node.type === 'punto') {
        typeLabel = "PUNTO";
        titleStyle = "text-slate-200 font-bold text-xs";
        bgStyle = "bg-slate-900/10";
      } else if (node.type === 'apartado') {
        typeLabel = "APARTADO";
        titleStyle = "text-violet-300 font-medium text-xs";
        bgStyle = "bg-slate-900/5";
      } else if (node.type === 'bloque') {
        typeLabel = "BLOQUE";
        titleStyle = "text-amber-300/90 text-xs";
        bgStyle = "bg-slate-950/20";
      } else if (node.type === 'desarrollo') {
        typeLabel = "DESARROLLO";
        titleStyle = "text-rose-300 text-xs italic";
        bgStyle = "bg-slate-950/40";
      }

      return (
        <div key={node.id} className={`${bgStyle} border-b ${borderStyle}`}>
          <div className={`p-3 grid grid-cols-12 gap-2 items-center hover:bg-slate-900/20 ${indentClass}`}>
            <div className="col-span-7 flex items-center gap-2">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(node.id)}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white focus:outline-none"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-5" />
              )}
              <span className={`text-[8px] px-1 py-0.5 rounded font-black tracking-wider uppercase bg-slate-850 text-slate-400 mr-1`}>
                {typeLabel}
              </span>
              <span className={titleStyle}>{node.title}</span>
            </div>

            <div className="col-span-5 flex justify-center gap-1">
              {['heredar', 'permitir', 'denegar'].map(m => {
                let btnColor = "bg-slate-850 text-slate-400 border-slate-750 hover:bg-slate-800";
                
                if (m === mode) {
                  if (m === 'heredar') btnColor = "bg-slate-700 text-white border-slate-600 font-bold";
                  if (m === 'permitir') btnColor = "bg-emerald-600/20 text-emerald-400 border-emerald-500/45 font-bold";
                  if (m === 'denegar') btnColor = "bg-red-600/20 text-red-400 border-red-500/45 font-bold";
                } else if (mode === 'heredar') {
                  if (m === 'permitir' && inheritedAccess === true) {
                    btnColor = "bg-emerald-950/20 text-emerald-500/80 border-emerald-500/60 border-dashed hover:bg-emerald-950/30";
                  } else if (m === 'denegar' && inheritedAccess === false) {
                    btnColor = "bg-red-950/20 text-red-500/80 border-red-500/60 border-dashed hover:bg-red-950/30";
                  }
                }

                return (
                  <button
                    key={m}
                    onClick={() => handleToggleUserPermission(selectedUser.email, node.id, m)}
                    className={`px-2.5 py-1 text-[9px] uppercase rounded-lg border transition cursor-pointer ${btnColor}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="divide-y divide-slate-850/40">
              {renderUserPermissionNodes(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-sm">
      
      {/* Botón Volver */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-teal-400 mb-6 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al Dashboard</span>
      </button>

      {/* ENCABEZADO Y CONTROLES DE SIMULACIÓN */}
      <div className="border-b pb-6 mb-6 border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-white flex items-center gap-2">
            <span className="text-teal-400">π</span> Panel de Administración y Permisos (RBAC)
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Gestión jerárquica de usuarios, permisos por rol, sobreescrituras individuales y simulación de vista en tiempo real.
          </p>
        </div>

        {/* SELECTOR DE SIMULACIÓN DE ROLES PARA ADMIN */}
        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Eye className="w-4 h-4" />
            <span>Simular Rol:</span>
          </div>
          <select
            value={simulatedRole || 'ninguno'}
            onChange={(e) => setSimulatedRole(e.target.value === 'ninguno' ? null : e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white font-bold text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ninguno">-- Sin simulación (Admin Real) --</option>
            <option value="invitado">Ver como Invitado</option>
            <option value="revisor">Ver como Revisor</option>
            <option value="admin">Ver como Administrador</option>
          </select>
        </div>
      </div>

      {/* SOLAPAS DE PANELES */}
      <div className="flex space-x-2 border-b border-slate-850 mb-6">
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-5 py-3 rounded-t-xl text-sm font-black transition flex items-center gap-2 border-t border-x ${activeTab === 'usuarios' ? 'bg-slate-900 text-teal-400 border-slate-800' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
          <Users className="w-5 h-5" />
          <span>Usuarios Registrados ({usuarios.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('permisos')}
          className={`px-5 py-3 rounded-t-xl text-sm font-black transition flex items-center gap-2 border-t border-x ${activeTab === 'permisos' ? 'bg-slate-900 text-teal-400 border-slate-800' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
        >
          <Shield className="w-5 h-5" />
          <span>Árbol Jerárquico de Permisos</span>
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="space-y-6">
          <form onSubmit={handleAddUser} className="p-6 rounded-2xl border bg-slate-900/40 border-slate-850 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold block">Email del Lector</label>
              <input
                type="email" required placeholder="ejemplo@fcecon.unr.edu.ar"
                value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold block">Nombre Completo</label>
              <input
                type="text" placeholder="Pablo Nicolás Demartis"
                value={newUserName} onChange={(e) => setNewUserName(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold block">Organización</label>
              <input
                type="text" placeholder="UNR"
                value={newUserOrg} onChange={(e) => setNewUserOrg(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-400 uppercase font-bold block">Rol Asignado</label>
              <select
                value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full text-sm font-bold py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-teal-500 cursor-pointer"
              >
                <option value="invitado">Invitado (por defecto)</option>
                <option value="revisor">Revisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-black flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transition"
            >
              <Plus className="w-5 h-5" />
              <span>Dar de Alta</span>
            </button>
          </form>

          <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/10">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 font-bold uppercase text-xs">
                  <th className="p-4">Usuario (Email)</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Organización</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Último Acceso</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-center">Permisos</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.email} className="border-b border-slate-850 hover:bg-slate-900/30">
                    <td className="p-4 font-mono font-bold text-slate-200">{u.email}</td>
                    <td className="p-4 font-semibold text-slate-300">{u.nombre}</td>
                    <td className="p-4 font-semibold text-slate-400">{u.organizacion || '-'}</td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => changeUserRole(u.email, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-teal-400 font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="invitado">Invitado</option>
                        <option value="revisor">Revisor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{formatLastLogin(u.last_login)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenUserPermissions(u)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-teal-400 hover:bg-slate-700 hover:text-teal-300 font-bold text-xs transition cursor-pointer"
                      >
                        Configurar
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleUserActive(u.email, u.is_active)}
                        className={`text-xs font-black uppercase px-3 py-1.5 rounded transition border cursor-pointer ${u.is_active ? 'border-red-800 text-red-400 hover:bg-red-500/10' : 'border-emerald-800 text-emerald-400 hover:bg-emerald-500/10'}`}
                      >
                        {u.is_active ? 'Baja' : 'Alta'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MATRIZ DE PERMISOS JERÁRQUICA (ÁRBOL COLAPSABLE) */}
      {activeTab === 'permisos' && (
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-350 text-sm leading-relaxed">
            Árbol Jerárquico de Accesos: Configura los permisos granulares por <strong>Parte &gt; Punto &gt; Apartado</strong>. 
            Los cambios guardan la herencia ascendente (si se habilita un apartado interno, el sistema permite la navegación del punto padre).
          </div>

          <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/20">
            <div className="bg-slate-900 border-b border-slate-850 p-4 text-slate-400 font-bold uppercase text-xs grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6 sm:col-span-7">Estructura del Índice Jerárquico</div>
              <div className="col-span-2 text-center">Invitado</div>
              <div className="col-span-2 text-center">Revisor</div>
              <div className="col-span-2 sm:col-span-1 text-center">Admin</div>
            </div>

            <div className="divide-y divide-slate-850">
              {renderTreeNodes(HIERARCHY_TREE)}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN DE PERMISOS INDIVIDUALES POR USUARIO */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
              <div>
                <h3 className="text-2xl font-black text-white">
                  Permisos Individuales
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Usuario: <span className="text-teal-400 font-bold">{selectedUser.nombre}</span> ({selectedUser.email}) — Rol: <span className="text-amber-400 font-bold capitalize">{selectedUser.role}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Scrollable Tree */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-slate-400 bg-slate-950/50 p-4 rounded-xl border border-slate-850 leading-relaxed">
                Configura excepciones individuales para este usuario. Si seleccionas <strong>Heredar</strong>, el usuario absorberá el permiso configurado para su rol. Si seleccionas <strong>Permitir</strong> o <strong>Denegar</strong>, esta regla tomará prioridad absoluta.
              </p>

              <div className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-950/40">
                <div className="bg-slate-900/80 p-3.5 border-b border-slate-850 text-slate-400 font-bold uppercase text-[10px] grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-7">Estructura del Índice</div>
                  <div className="col-span-5 text-center">Permiso Individual</div>
                </div>

                <div className="divide-y divide-slate-850">
                  {renderUserPermissionNodes(HIERARCHY_TREE)}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-900/90 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-black shadow-lg cursor-pointer transition"
              >
                Listo / Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
