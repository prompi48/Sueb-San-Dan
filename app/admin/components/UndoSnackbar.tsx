import styles from './UndoSnackbar.module.css';

export default function UndoSnackbar({ action, onUndo }: any) {
  return (
    <div className={`${styles.snackbar} ${styles[action.type]}`}>
      <span>
        {action.type === 'accept' ? 'Accepted' : 'Deleted'}: {action.postData.title}
      </span>
      <button onClick={onUndo} className={styles.button}>
        UNDO
      </button>
    </div>
  );
}