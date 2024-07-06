import styles from "./Donate.module.css";

function KofiFrame() {
  return (
    <iframe
      id="kofiframe"
      className={styles.kofiFrame}
      src="https://ko-fi.com/rosalinekarr/?hidefeed=true&widget=true&embed=true&preview=true"
      height="712"
      title="rosalinekarr"
    ></iframe>
  );
}

export default function Donate() {
  return (
    <div className={styles.donate}>
      <div className={styles.donateContainer}>
        <KofiFrame />
      </div>
    </div>
  );
}
