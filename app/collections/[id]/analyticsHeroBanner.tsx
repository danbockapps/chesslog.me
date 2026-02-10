import Link from 'next/link'
import styles from './analyticsHeroBanner.module.css'

interface Props {
  collectionId: string
  annotatedCount: number
}

export default function AnalyticsHeroBanner({collectionId, annotatedCount}: Props) {
  const isLocked = annotatedCount < 5

  return (
    <div className={`${styles.banner} ${isLocked ? styles.locked : ''}`}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 className={styles.title}>
            {isLocked ? 'Start Logging Your Games' : 'Unlock Your Chess Insights'}
          </h2>
          <p className={styles.description}>
            {isLocked
              ? 'Add tags or notes to your games to unlock analytics. Log at least 5 games to get started.'
              : 'Discover patterns, track improvements, and understand your playing style with powerful visual analytics'}
          </p>
          {isLocked && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{width: `${(Math.min(annotatedCount, 5) / 5) * 100}%`}}
                />
              </div>
              <span className={styles.progressText}>{annotatedCount} of 5 games logged</span>
            </div>
          )}
        </div>
        <div className={styles.visuals}>
          <svg
            className={styles.icon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
          </svg>
          <svg
            className={styles.icon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <svg
            className={styles.icon}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>
      </div>
      {isLocked ? (
        <div className={styles.ctaButtonDisabled}>
          <span className={styles.ctaContent}>
            <svg
              className={styles.ctaIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className={styles.ctaText}>View Analytics</span>
          </span>
        </div>
      ) : (
        <Link href={`/collections/${collectionId}?analytics=open`} className={styles.ctaButton}>
          <span className={styles.ctaGlow}></span>
          <span className={styles.ctaContent}>
            <svg
              className={styles.ctaIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v18h18" />
              <path d="M18 17V9" />
              <path d="M13 17V5" />
              <path d="M8 17v-3" />
            </svg>
            <span className={styles.ctaText}>View Analytics</span>
            <svg
              className={styles.ctaArrow}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      )}
    </div>
  )
}
