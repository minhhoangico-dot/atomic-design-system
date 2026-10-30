import { useState } from 'react';
import styles from './BookingForm.module.css';

export function BookingForm({ onSubmit }: { onSubmit: (d: { name: string; phone: string; dob: string }) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState(false);
  const valid = name && phone && dob;

  return (
    <div className={styles.form}>
      <h3 className={styles.title}>ĐẶT LỊCH KHÁM</h3>
      <input className={styles.input} placeholder="Họ tên" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={styles.input} placeholder="SĐT" value={phone} onChange={(e) => { setPhone(e.target.value); setError(!/^\d{10}$/.test(e.target.value)); }} />
      <input className={styles.input} type="date" placeholder="Ngày sinh" value={dob} onChange={(e) => setDob(e.target.value)} />
      {error && <span className={styles.error}>Sai</span>}
      <div className={styles.submit} onClick={() => valid && onSubmit({ name, phone, dob })} aria-disabled={!valid}>
        Gửi
      </div>
    </div>
  );
}
