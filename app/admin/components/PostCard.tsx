import { useState } from 'react';
import { Icon } from '@iconify/react';
import styles from './PostCard.module.css';

export default function PostCard({ post, onAction }: any) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <div>
        <h2 className={styles.title}>{post.title}</h2>

        <p
          onClick={() => setExpanded(!expanded)}
          className={`${styles.desc} ${!expanded ? styles.clamp : ''}`}
        >
          {post.description}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className={styles.readmore}
        >
          {expanded ? '▲ COLLAPSE' : '▼ READ MORE'}
        </button>

        {expanded && post.media_link && (
          <a
            href={post.media_link.startsWith('http') ? post.media_link : `https://${post.media_link}`}
            target="_blank"
            className={styles.link}
          >
            <Icon icon="pixelarticons:external-link" width="14" />
            {post.media_link}
          </a>
        )}

        {expanded && (
          <div className={styles.meta}>
            <p>
              {post.subject_name || '-'} | {post.subject_id || '-'}
            </p>
            <p>{new Date(post.created_at).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.username}>
          BY: {post.profiles?.username || 'UNKNOWN'}
        </span>

        <div className={styles.actions}>
          <button
            onClick={() => onAction(post.id, 'accept')}
            className={styles.accept}
          >
            <Icon icon="pixelarticons:check" width="24" />
          </button>

          <button
            onClick={() => onAction(post.id, 'delete')}
            className={styles.delete}
          >
            <Icon icon="pixelarticons:close" width="24" />
          </button>
        </div>
      </div>
    </div>
  );
}