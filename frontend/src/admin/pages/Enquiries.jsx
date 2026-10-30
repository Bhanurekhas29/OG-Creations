import { Fragment, useCallback, useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import { api } from '../api.js';
import { useNotice, useConfirm } from '../components/Toast.jsx';

const fmt = (s) => new Date(s.replace(' ', 'T')).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Enquiries() {
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [, setError] = useNotice('error');
  const [, setMsg] = useNotice('success');

  const load = useCallback(() => api('admin/enquiries').then((r) => {
    setRows(r.data);
    setUnread(r.unread);
    setLoaded(true);
  }), []);
  useEffect(() => { load(); }, [load]);

  const setRead = async (row, read) => {
    setError('');
    try {
      await api(`admin/enquiries?id=${row.id}&read=${read ? 1 : 0}`, { method: 'POST' });
      load();
    } catch (ex) {
      setError(ex.message);
    }
  };

  const toggle = (row) => {
    setOpen(open === row.id ? null : row.id);
    if (!row.is_read) setRead(row, true);
  };

  const remove = async (row) => {
    if (!await confirm(`Delete the enquiry from “${row.name}”? This cannot be undone.`)) return;
    setError('');
    setMsg('');
    try {
      await api(`admin/enquiries?id=${row.id}`, { method: 'DELETE' });
      setMsg('Enquiry deleted.');
      load();
    } catch (ex) {
      setError(ex.message);
    }
  };

  return (
    <div className="panel panel-wide">
      <div className="panel-head">
        <h3>Enquiries {unread > 0 && <span className="badge badge-unread">{unread} unread</span>}</h3>
      </div>

      {loaded && !rows.length ? (
        <p className="empty">No enquiries yet. Messages sent from the website’s contact form will appear here.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>Received</th><th>Name</th><th>Phone</th><th>Email</th><th>Service</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <Fragment key={r.id}>
                  <tr className={`row-click ${r.is_read ? '' : 'row-unread'}`} onClick={() => toggle(r)}>
                    <td>{fmt(r.created_at)}</td>
                    <td>{r.name}</td>
                    <td>+91 {r.phone}</td>
                    <td><a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()}>{r.email}</a></td>
                    <td>{r.service}</td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-btn" onClick={() => setRead(r, !r.is_read)} aria-label={r.is_read ? 'Mark as unread' : 'Mark as read'} title={r.is_read ? 'Mark as unread' : 'Mark as read'}>
                        {r.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                      </button>
                      <button className="icon-btn danger" onClick={() => remove(r)} aria-label="Delete"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                  {open === r.id && (
                    <tr className="row-detail"><td colSpan={6}><strong>Project details</strong><p>{r.message}</p></td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
