import styles from "./About.module.css";

export default function About() {
  return (
    <div className={styles.about}>
      <div className={styles.aboutContainer}>
        <h2>About</h2>
        <p>
          Neon Estate is an application that I (
          <a href="https://rosalinekarr.com">Rose Karr</a>) am working on as a
          side project and a sort of experiment in systems of governance for
          online communities. The project is intended to be as a simple social
          network with posts and comments subdivided into "rooms." Each room is
          meant to be an independent, user-created community managed according
          to a user-chosen rule system. These rule systems can be anarchist or
          authoritarian, pluralist or monarchist, democratic or despotic, etc.
          While the current options are somewhat limited, my goal is to enable
          as many variations of rule systems as possible.
        </p>
        <p>
          These systems are also the heart of the experiment. Which systems will
          lead to the most popular communities? Which systems will foster
          healthy, inclusive environments? Which will foster toxicity? How do
          the rules enforced on our online speech shape the way we express
          ourselves and the connections we build?
        </p>
        <p>
          As a former moderator of{" "}
          <a href="https://www.reddit.com/r/traaaaaaannnnnnnnnns/">
            a large online community
          </a>
          , I know first-hand the headache that is managing spaces for large
          numbers of people. In addition to the heavy workload of organizing and
          moderation, community management can often become intellectually and
          emotionally draining. Managing any space for a group of people is an
          inheritly political challenge, and where there's politics, there's
          power struggles, tribalism and other forms of drama. My hope is that
          by studying system of online community management, we might gain some
          valuable insights into these challenges and how to build a better
          online spaces.
        </p>
      </div>
    </div>
  );
}
