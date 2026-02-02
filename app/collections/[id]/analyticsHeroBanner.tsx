import Link from 'next/link'
import styles from './analyticsHeroBanner.module.css'

interface Props {
  collectionId: string
}

export default function AnalyticsHeroBanner({collectionId}: Props) {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h2 className={styles.title}>Unlock Your Chess Insights</h2>
          <p className={styles.description}>
            Discover patterns, track improvements, and understand your playing style with powerful
            visual analytics
          </p>
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
    </div>
  )
}
