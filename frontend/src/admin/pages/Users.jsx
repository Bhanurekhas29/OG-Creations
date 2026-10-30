import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const EMPTY = { id: null, name: '', username: '', email: '', password: '', is_active: true };

export default function Users() {
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [meId, setMeId] = useState(null);
  const [form, setForm] = useState(null); // null = list view
  const [fieldErrors, setFieldErrors] = useState({});
  const [, setMsg] = useNotice('success');
  const [, setError] = useNotice('error');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api('admin/users').then((r) => {
      setUsers(r.data);
      setMeId(r.me);
    });
  }, []);
  useEffect(load, [load]);

  const open = (u) => {
    setMsg('');
    setError('');
    setFieldErrors({});
    setForm(u ? { ...u, password: '', is_active: !!u.is_active } : EMPTY);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const editing = !!form.id;
      await api(editing ? `admin/users?id=${form.id}` : 'admin/users', {
        method: editing ? 'PUT' : 'POST',
        body: form,
      });
      setForm(null);
      setMsg(editing ? 'User updated.' : 'User added.');
      load();
    } catch (err) {
      setError(err.message);
      setFieldErrors(err.errors || {});
    }
    setBusy(false);
  };

  const remove = async (u) => {
    if (!await confirm(`Delete user “${u.username}”? This cannot be undone.`)) return;
    setMsg('');
    setError('');
    try {
      await api(`admin/users?id=${u.id}`, { method: 'DELETE' });
      setMsg('User deleted.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  if (form) {
    const err = (k) => fieldErrors[k] && <em className="field-error">{fieldErrors[k]}</em>;
    return (
      <form className="panel" onSubmit={submit}>
        <h3>{form.id ? 'Edit user' : 'Add user'}</h3>

        <label className="field">
          <span>Name</span>
          <input value={form.name} onChange={set('name')} required />
          {err('name')}
        </label>
        <label className="field">
          <span>Username</span>
          <input value={form.username} onChange={set('username')} autoComplete="off" required />
          {err('username')}
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} required />
          {err('email')}
        </label>
        <label className="field">
          <span>{form.id ? 'New password (leave blank to keep current)' : 'Password'}</span>
          <input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" minLength={form.id ? undefined : 8} required={!form.id} />
          {err('password')}
        </label>
        <label className="check">
          <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
          <span>Active (can sign in to the admin panel)</span>
        </label>
        {err('is_active')}

        <div className="btn-row">
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn btn-outline" onClick={() => setForm(null)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="panel panel-wide">
      <div className="panel-head">
        <h3>Users</h3>
        <button className="btn btn-primary" onClick={() => open(null)}><Plus size={16} /> Add user</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Username</th><th>Email</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}{u.id === meId && <span className="badge">You</span>}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.is_active ? 'badge-ok' : 'badge-off'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="actions">
                  <button className="icon-btn" onClick={() => open(u)} aria-label="Edit"><Pencil size={16} /></button>
                  {u.id !== meId && (
                    <button className="icon-btn danger" onClick={() => remove(u)} aria-label="Delete"><Trash2 size={16} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
